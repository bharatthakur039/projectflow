import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, handleApiError } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return apiSuccess({ projects: [], sprints: [], tickets: [] });
    }

    // 1. Find user's accessible project IDs
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { created_by: user.userId },
          { members: { some: { user_id: user.userId } } },
        ],
      },
      select: { id: true, name: true, created_by: true },
    });

    const projectIds = userProjects.map((p) => p.id);
    const projectMap = new Map(userProjects.map((p) => [p.id, p]));

    if (projectIds.length === 0) {
      return apiSuccess({ projects: [], sprints: [], tickets: [] });
    }

    // Parse ticket ID if user searches "PF-12" or "12"
    let numericTicketId: number | null = null;
    const cleanKeyMatch = q.match(/^(?:pf-?)?(\d+)$/i);
    if (cleanKeyMatch) {
      numericTicketId = parseInt(cleanKeyMatch[1], 10);
    }

    // 2. Search Projects
    const matchedProjects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_by: true,
      },
      take: 5,
    });

    const normalizedQ = q.replace(/spring/gi, "sprint").trim();
    const sprintNumberMatch = normalizedQ.match(/(?:sprint\s*#?|#)?(\d+)/i);

    // 3. Search Sprints
    const sprintOrConditions: Array<Record<string, unknown>> = [
      { name: { contains: q, mode: "insensitive" } },
    ];
    if (normalizedQ !== q) {
      sprintOrConditions.push({ name: { contains: normalizedQ, mode: "insensitive" } });
    }
    if (sprintNumberMatch) {
      const num = sprintNumberMatch[1];
      sprintOrConditions.push({ name: { contains: `Sprint ${num}`, mode: "insensitive" } });
    }

    const matchedSprints = await prisma.sprint.findMany({
      where: {
        project_id: { in: projectIds },
        OR: sprintOrConditions,
      },
      select: {
        id: true,
        name: true,
        status: true,
        project_id: true,
        start_date: true,
        end_date: true,
      },
      take: 10,
    });

    // Sort sprints so exact / closer matches come first
    matchedSprints.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      const target = normalizedQ.toLowerCase();
      const aExact = aName === target;
      const bExact = bName === target;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      const aStarts = aName.startsWith(target);
      const bStarts = bName.startsWith(target);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    const sprintsWithProject = matchedSprints.slice(0, 5).map((s) => ({
      ...s,
      projectName: projectMap.get(s.project_id)?.name ?? `Project #${s.project_id}`,
    }));

    // 4. Search Tickets
    const ticketOrConditions: Array<Record<string, unknown>> = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
    if (numericTicketId !== null) {
      ticketOrConditions.push({ id: numericTicketId });
    }

    const matchedTickets = await prisma.ticket.findMany({
      where: {
        project_id: { in: projectIds },
        OR: ticketOrConditions,
      },
      select: {
        id: true,
        title: true,
        status: true,
        estimation: true,
        project_id: true,
        sprint_id: true,
        assignee_id: true,
        author_id: true,
        assignee: {
          select: { id: true, full_name: true, email: true },
        },
        sprint: {
          select: { id: true, name: true, status: true },
        },
      },
      take: 8,
    });

    // Filter tickets for non-owners
    const visibleTickets = matchedTickets.filter((t) => {
      const project = projectMap.get(t.project_id);
      const isOwner = project?.created_by === user.userId;
      if (isOwner) return true;
      return t.assignee_id === user.userId || t.author_id === user.userId;
    });

    const ticketsWithProject = visibleTickets.map((t) => ({
      ...t,
      projectName: projectMap.get(t.project_id)?.name ?? `Project #${t.project_id}`,
    }));

    return apiSuccess({
      projects: matchedProjects,
      sprints: sprintsWithProject,
      tickets: ticketsWithProject,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
