import { useMyLecturerSelections } from './lecturerSelectionService';

export const useEnrollmentStatus = () => {
  const { data: selectionsResponse, isLoading } = useMyLecturerSelections();
  const selections = selectionsResponse || [];

  const isFieldPoolRegistered = (fieldPoolId: string) => {
    return selections.some(
      (selection) => selection.fieldPoolId === fieldPoolId,
    );
  };

  const getFieldPoolRegistrationStatus = (fieldPoolId: string) => {
    const selection = selections.find(
      (selection) => selection.fieldPoolId === fieldPoolId,
    );
    return selection?.status || null;
  };

  return {
    isFieldPoolRegistered,
    getFieldPoolRegistrationStatus,
    isLoading,
    selections,
  };
};
