"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "@dagrejs/dagre"
import { Users, Loader2, Plus, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/context/auth-context"
import { toast } from "sonner"

const NODE_W = 220
const NODE_H = 100

function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 40 })

  for (const n of nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H })
  for (const e of edges) g.setEdge(e.source, e.target)
  dagre.layout(g)

  const positioned = nodes.map((n) => {
    const pos = g.node(n.id)
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } }
  })

  return { nodes: positioned, edges }
}

const pkgStyle: Record<string, string> = {
  diamond: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gold: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  bronze: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

function MemberNode({ data }: NodeProps) {
  const d = data as {
    label: string
    email: string
    packageType?: string | null
    childCount: number
    isRoot: boolean
    expanded: boolean
    expandLoading: boolean
    onExpand: () => void
  }

  const canExpand = !d.isRoot && !d.expanded && d.childCount > 0

  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-md transition-shadow hover:shadow-lg ${
        d.isRoot ? "border-accent/50 bg-accent/10" : "border-border bg-card"
      }`}
      style={{ width: NODE_W }}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-2 !h-2 !border-0" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {d.isRoot && <Crown className="h-3.5 w-3.5 shrink-0 text-accent" />}
            <p className="truncate text-sm font-semibold text-foreground">{d.label}</p>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{d.email}</p>
        </div>
        {d.packageType && (
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] capitalize ${pkgStyle[d.packageType] ?? "bg-muted text-muted-foreground"}`}
          >
            {d.packageType}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {d.childCount} referral{d.childCount !== 1 ? "s" : ""}
        </span>
        {canExpand && (
          <button
            onClick={(e) => { e.stopPropagation(); d.onExpand() }}
            disabled={d.expandLoading}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
          >
            {d.expandLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Expand
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-2 !h-2 !border-0" />
    </div>
  )
}

const nodeTypes = { member: MemberNode }

const edgeDefaults = { style: { stroke: "hsl(var(--accent))", strokeWidth: 2 }, animated: true }

/** Same order of magnitude as dashboard queries; fail fast if RPC/DB is misconfigured */
const RPC_TIMEOUT_MS = 12_000

type ChildRow = { id: string; full_name: string; email: string; created_at: string; package_type?: string | null; child_count: number }

async function fetchChildrenWithCounts(parentId: string): Promise<ChildRow[]> {
  const controller = new AbortController()
  const kill = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS)

  try {
    const res = await fetch("/api/affiliate/direct-referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ parentId }),
      signal: controller.signal,
    })

    const body = (await res.json().catch(() => ({}))) as {
      data?: ChildRow[]
      error?: string
      hint?: string
    }

    if (!res.ok) {
      throw new Error(
        [body.error, body.hint].filter(Boolean).join(" ") ||
          `Could not load referrals (${res.status}).`,
      )
    }

    return (body.data ?? []) as ChildRow[]
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        `Request timed out (${RPC_TIMEOUT_MS / 1000}s). Run migration 007 in Supabase, confirm the project is not paused, or try another network.`,
      )
    }
    throw e
  } finally {
    clearTimeout(kill)
  }
}

function TreeInner() {
  const { user } = useAuth()
  const { fitView } = useReactFlow()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const expandedRef = useRef<Set<string>>(new Set())

  const commitLayout = useCallback((ns: Node[], es: Edge[]) => {
    const result = layoutGraph(ns, es)
    nodesRef.current = result.nodes
    edgesRef.current = result.edges
    setNodes(result.nodes)
    setEdges(result.edges)
    setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50)
  }, [fitView])

  const handleExpand = useCallback(async (parentId: string) => {
    if (expandedRef.current.has(parentId)) return
    expandedRef.current.add(parentId)

    nodesRef.current = nodesRef.current.map((n) =>
      n.id === parentId ? { ...n, data: { ...n.data, expandLoading: true } } : n
    )
    setNodes([...nodesRef.current])

    let children: ChildRow[]
    try {
      children = await fetchChildrenWithCounts(parentId)
    } catch (err) {
      expandedRef.current.delete(parentId)
      const msg = err instanceof Error ? err.message : "Failed to load downline."
      toast.error(msg)
      nodesRef.current = nodesRef.current.map((n) =>
        n.id === parentId ? { ...n, data: { ...n.data, expandLoading: false } } : n
      )
      setNodes([...nodesRef.current])
      return
    }

    if (!children.length) {
      expandedRef.current.delete(parentId)
      nodesRef.current = nodesRef.current.map((n) =>
        n.id === parentId ? { ...n, data: { ...n.data, expandLoading: false } } : n
      )
      setNodes([...nodesRef.current])
      return
    }

    const newNodes: Node[] = children.map((c) => ({
      id: c.id,
      type: "member" as const,
      position: { x: 0, y: 0 },
      data: {
        label: c.full_name || c.email?.split("@")[0] || "User",
        email: c.email,
        packageType: c.package_type,
        childCount: c.child_count,
        isRoot: false,
        expanded: false,
        expandLoading: false,
        onExpand: () => handleExpand(c.id),
      },
    }))

    const newEdges: Edge[] = children.map((c) => ({
      id: `e-${parentId}-${c.id}`,
      source: parentId,
      target: c.id,
      ...edgeDefaults,
    }))

    const updatedNodes = nodesRef.current.map((n) =>
      n.id === parentId ? { ...n, data: { ...n.data, expanded: true, expandLoading: false } } : n
    )

    commitLayout([...updatedNodes, ...newNodes], [...edgesRef.current, ...newEdges])
  }, [commitLayout])

  useEffect(() => {
    if (!user?.id) return

    ;(async () => {
      try {
        const children = await fetchChildrenWithCounts(user.id)

        const root: Node = {
          id: user.id,
          type: "member",
          position: { x: 0, y: 0 },
          data: {
            label: user.name,
            email: user.email,
            packageType: null,
            childCount: children.length,
            isRoot: true,
            expanded: true,
            expandLoading: false,
            onExpand: () => {},
          },
        }

        const childNodes: Node[] = children.map((c) => ({
          id: c.id,
          type: "member" as const,
          position: { x: 0, y: 0 },
          data: {
            label: c.full_name || c.email?.split("@")[0] || "User",
            email: c.email,
            packageType: c.package_type,
            childCount: c.child_count,
            isRoot: false,
            expanded: false,
            expandLoading: false,
            onExpand: () => handleExpand(c.id),
          },
        }))

        const initEdges: Edge[] = children.map((c) => ({
          id: `e-${user.id}-${c.id}`,
          source: user.id,
          target: c.id,
          ...edgeDefaults,
        }))

        expandedRef.current.add(user.id)
        commitLayout([root, ...childNodes], initEdges)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        console.error("NetworkTree error:", msg)
        setError(msg)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id, user?.name, user?.email, handleExpand, commitLayout])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Could not load network data.</p>
        <p className="mt-1 font-mono text-xs text-destructive/70">{error}</p>
      </div>
    )
  }

  const hasReferrals = nodes.length > 1

  return (
    <div className="space-y-3">
      <div
        className={`w-full overflow-hidden rounded-md border border-border ${hasReferrals ? "h-[500px]" : "h-[200px]"}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
        >
          <Background gap={20} size={1} color="hsl(var(--border))" />
          <Controls
            showInteractive={false}
            className="!border-border !bg-card !shadow-lg [&>button]:!border-border [&>button]:!bg-card [&>button]:!fill-foreground hover:[&>button]:!bg-muted"
          />
        </ReactFlow>
      </div>
      {!hasReferrals && (
        <p className="text-center text-xs text-muted-foreground">
          No referrals yet. Share your link to start building your network!
        </p>
      )}
    </div>
  )
}

export function NetworkTree() {
  return (
    <ReactFlowProvider>
      <TreeInner />
    </ReactFlowProvider>
  )
}
