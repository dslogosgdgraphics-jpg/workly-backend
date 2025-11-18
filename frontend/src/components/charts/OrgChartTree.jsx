import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Avatar from '../common/Avatar';

export default function OrgChartTree({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(40,40)');

    const tree = d3.tree().size([width - 80, height - 160]);

    const root = d3.hierarchy(data);
    tree(root);

    // Links
    svg
      .selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      );

    // Nodes
    const node = svg
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Node background
    node
      .append('rect')
      .attr('width', 200)
      .attr('height', 80)
      .attr('x', -100)
      .attr('y', -40)
      .attr('rx', 8)
      .attr('fill', '#fff')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#f1f5f9');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#fff');
      });

    // Employee photo (circle)
    node
      .append('circle')
      .attr('cx', -60)
      .attr('cy', 0)
      .attr('r', 20)
      .attr('fill', '#3b82f6');

    // Employee initials
    node
      .append('text')
      .attr('x', -60)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => {
        const name = d.data.name || '';
        return name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      });

    // Employee name
    node
      .append('text')
      .attr('x', -30)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text((d) => {
        const name = d.data.name || '';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
      });

    // Employee designation
    node
      .append('text')
      .attr('x', -30)
      .attr('y', 10)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .text((d) => {
        const designation = d.data.designation || '';
        return designation.length > 22 ? designation.substring(0, 22) + '...' : designation;
      });

    // Department badge
    node
      .append('rect')
      .attr('x', -30)
      .attr('y', 18)
      .attr('width', 80)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#dbeafe');

    node
      .append('text')
      .attr('x', 10)
      .attr('y', 29)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#1e40af')
      .text((d) => {
        const dept = d.data.department || 'N/A';
        return dept.length > 12 ? dept.substring(0, 12) + '...' : dept;
      });
  }, [data]);

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
}