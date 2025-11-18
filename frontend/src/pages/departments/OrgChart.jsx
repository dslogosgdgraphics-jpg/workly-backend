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
      .attr('font-size',import { useQuery } from 'react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import OrgChartTree from '../../components/charts/OrgChartTree';

export default function OrgChart() {
  const navigate = useNavigate();

  const { data: hierarchy, isLoading } = useQuery('org-hierarchy', async () => {
    const [departments, employees] = await Promise.all([
      api.get('/departments/hierarchy'),
      api.get('/employees'),
    ]);

    // Build org chart data
    const buildTree = (depts, emps) => {
      const ceo = emps.data?.find((emp) => emp.role === 'admin' && !emp.department);

      if (!ceo) {
        // No CEO, build from departments
        return {
          name: 'Company',
          designation: 'Organization',
          children: depts.data?.map((dept) => ({
            name: dept.name,
            designation: 'Department',
            department: dept.name,
            children: emps.data
              ?.filter((emp) => emp.department?._id === dept._id || emp.department === dept._id)
              .map((emp) => ({
                name: emp.name,
                designation: emp.designation,
                department: dept.name,
                email: emp.email,
              })),
          })),
        };
      }

      // Build from CEO down
      return {
        name: ceo.name,
        designation: ceo.designation,
        department: 'Executive',
        email: ceo.email,
        children: depts.data?.map((dept) => ({
          name: dept.head?.name || dept.name,
          designation: dept.head?.designation || 'Department Head',
          department: dept.name,
          email: dept.head?.email,
          children: emps.data
            ?.filter(
              (emp) =>
                (emp.department?._id === dept._id || emp.department === dept._id) &&
                emp._id !== dept.head?._id
            )
            .map((emp) => ({
              name: emp.name,
              designation: emp.designation,
              department: dept.name,
              email: emp.email,
            })),
        })),
      };
    };

    return buildTree(departments, employees);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/departments')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
            <p className="text-gray-600 mt-1">Visual company structure</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export
        </Button>
      </div>

      {/* Org Chart */}
      <Card>
        <OrgChartTree data={hierarchy} />
      </Card>

      {/* Legend */}
      <Card title="Legend">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Executive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Department Head</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-600">Employee</span>
          </div>
        </div>
      </Card>
    </div>
  );
} '10px')
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