
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { OrgNode } from '../types';

interface OrgChartProps {
  data: OrgNode | null;
}

const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<OrgNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const root = d3.hierarchy<OrgNode>(data);

    tree(root);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", "1.5px")
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x) as any
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 10)
      .attr("fill", d => d.children ? "#3b82f6" : "#10b981");

    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(d => d.data.name);

    node.append("text")
      .attr("dy", "1.45em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", "10px")
      .style("fill", "#64748b")
      .text(d => d.data.title);

  }, [data]);

  if (!data) return (
    <div className="flex items-center justify-center h-64 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
      <p className="text-slate-500">Generating organization chart data...</p>
    </div>
  );

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <svg ref={svgRef} width="800" height="400" viewBox="0 0 800 400"></svg>
    </div>
  );
};

export default OrgChart;
