import { useMyStudentSelections } from './studentSelectionService';

// Check if a student has registered for a specific field pool
export const useEnrollmentStatus = () => {
  const { data: selectionsResponse, isLoading } = useMyStudentSelections();
  const selections = selectionsResponse?.data?.data?.data || [];

  // Function to check if the user is registered for a specific field pool
  const isFieldPoolRegistered = (fieldPoolId: string) => {
    return selections.some(
      (selection) => selection.fieldPoolId === fieldPoolId,
    );
  };

  // Function to get the registration status for a specific field pool
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
