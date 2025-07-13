export const BasicStudent = {
  id: true,
  fullName: true,
  studentCode: true,
  email: true,
  profilePicture: true,
  // facultyCode: true,
  Faculty: { select: { id: true, name: true, facultyCode: true } },
};

export const BasicFaculty = {
  id: true,
  fullName: true,
  email: true,
  profilePicture: true,
  // facultyCode: true,
  Faculty: { select: { id: true, name: true, facultyCode: true } },
};
