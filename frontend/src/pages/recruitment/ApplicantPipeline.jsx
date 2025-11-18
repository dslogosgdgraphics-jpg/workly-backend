import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Mail, Phone, Calendar, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { id: 'screening', label: 'Screening', color: 'bg-yellow-500' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-500' },
  { id: 'assessment', label: 'Assessment', color: 'bg-indigo-500' },
  { id: 'offer', label: 'Offer', color: 'bg-green-500' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

export default function ApplicantPipeline() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: applicants, isLoading } = useQuery(['applicants', jobId], () =>
    api.get(`/recruitment/applicants?jobId=${jobId}`)
  );

  const updateStageMutation = useMutation(
    ({ applicantId, stage }) =>
      api.put(`/recruitment/applicants/${applicantId}/stage`, { stage }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['applicants', jobId]);
        toast.success('Applicant stage updated');
      },
      onError: () => {
        toast.error('Failed to update stage');
      },
    }
  );

  const groupByStage = (applicants) => {
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = applicants?.filter((app) => app.stage === stage.id) || [];
      return acc;
    }, {});
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const applicantId = draggableId;
    const newStage = destination.droppableId;

    updateStageMutation.mutate({ applicantId, stage: newStage });
  };

  const groupedApplicants = groupByStage(applicants?.data || []);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applicant Pipeline</h1>
        <p className="text-gray-600 mt-1">Drag and drop to move candidates</p>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto">
          {STAGES.map((stage) => (
            <Droppable key={stage.id} droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] rounded-lg p-4 ${
                    snapshot.isDraggingOver ? 'bg-primary-50' : 'bg-gray-50'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {groupedApplicants[stage.id]?.length || 0}
                    </Badge>
                  </div>

                  {/* Applicant Cards */}
                  <div className="space-y-3">
                    {groupedApplicants[stage.id]?.map((applicant, index) => (
                      <Draggable
                        key={applicant._id}
                        draggableId={applicant._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setShowDetailsModal(true);
                            }}
                            className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar
                                name={`${applicant.firstName} ${applicant.lastName}`}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {applicant.firstName} {applicant.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {applicant.currentDesignation || 'N/A'}
                                </p>
                                {applicant.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs text-gray-600">
                                      {applicant.rating}/5
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Applicant Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Applicant Details"
        size="lg"
      >
        {selectedApplicant && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar
                name={`${selectedApplicant.firstName} ${selectedApplicant.lastName}`}
                size="xl"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedApplicant.firstName} {selectedApplicant.lastName}
                </h3>
                <p className="text-gray-600">
                  {selectedApplicant.currentDesignation || 'N/A'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedApplicant.email}
                  </div>
                  {selectedApplicant.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedApplicant.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resume & Links */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" as="a" href={selectedApplicant.resumeUrl} target="_blank">
                View Resume
              </Button>
              {selectedApplicant.linkedIn && (
                <Button
                  variant="outline"
                  as="a"
                  href={selectedApplicant.linkedIn}
                  target="_blank"
                >
                  LinkedIn Profile
                </Button>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Experience</p>
                <p className="font-medium">{selectedApplicant.experience || 0} years</p>
              </div>
              <div>
                <p className="text-gray-600">Expected Salary</p>
                <p className="font-medium">
                  {selectedApplicant.expectedSalary
                    ? `$${selectedApplicant.expectedSalary.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Current Company</p>
                <p className="font-medium">{selectedApplicant.currentCompany || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Notice Period</p>
                <p className="font-medium">
                  {selectedApplicant.noticePeriod
                    ? `${selectedApplicant.noticePeriod} days`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Skills */}
            {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.map((skill, index) => (
                    <Badge key={index} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowScheduleModal(true);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Note
              </Button>
              <Button variant="danger">Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}