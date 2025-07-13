export interface BasicStudent {
  id: string;
  fullName: string;
  studentCode: string;
  email?: string | null;
  profilePicture?: string | null;
  Faculty?: Faculty;
}

export interface BasicFaculty {
  id: string;
  fullName: string;
  email?: string | null;
  profilePicture?: string | null;
  Faculty?: Faculty;
  facultyCode: string;
}

export interface Faculty {
  id: string;
  name: string;
  facultyCode: string;
}
