// Utility functions for generating various identifiers

export const generateRequestNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `REQ${year}${month}${day}${random}`;
};

export const generateInquiryNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INQ${year}${month}${day}${random}`;
};

export const generatePasswordResetToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
};

export const calculateAssignmentHours = (requestDate: Date, assignmentDate?: Date): number => {
  if (!assignmentDate) return 0;
  
  const diffMs = assignmentDate.getTime() - requestDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
};

export const calculateWorkHours = (workStartDate?: Date, workCompletionDate?: Date): number => {
  if (!workStartDate || !workCompletionDate) return 0;
  
  const diffMs = workCompletionDate.getTime() - workStartDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
};
