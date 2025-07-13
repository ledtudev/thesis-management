import { Priority, Project, Status, Task, Team, User } from '@/state/api';

export const users: User[] = [
  {
    userId: 1,
    username: 'le_dinh_tu',
    email: 'ledinhtu@example.com',
    profilePictureUrl:
      'https://th.bing.com/th/id/OIP.-ByAdVJ16Zn7eNtLqBcWrwHaHa?w=164&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    cognitoId: 'abc123',
    teamId: 1,
  },
  {
    userId: 2,
    username: 'heydarling',
    email: 'heydarling@example.com',
    profilePictureUrl:
      'https://th.bing.com/th/id/OIP.9V9-uKWj9OJ7eAJcjTTnMQHaHa?w=176&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    cognitoId: 'xyz789',
    teamId: 2,
  },
  {
    userId: 3,
    username: 'alice_rose',
    email: 'alice.rose@example.com',
    profilePictureUrl:
      'https://th.bing.com/th/id/OIP.YNnsW0lr1tnSgcj9OxH2ZAHaEK?w=286&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    cognitoId: 'def456',
    teamId: 1,
  },
  {
    userId: 4,
    username: 'bob_smith',
    email: 'bob.smith@example.com',
    profilePictureUrl:
      'https://th.bing.com/th/id/OIP.8hZWw4pBUBL2cPDy0wiONQHaEK?w=286&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    cognitoId: 'ghi789',
    teamId: 2,
  },
];

export const teams: Team[] = [
  {
    teamId: 1,
    teamName: 'Frontend',
    productOwnerUserId: 1,
    projectManagerUserId: 2,
  },
  {
    teamId: 2,
    teamName: 'Backend',
    productOwnerUserId: 2,
    projectManagerUserId: 1,
  },
  {
    teamId: 3,
    teamName: 'QA',
    productOwnerUserId: 3,
    projectManagerUserId: 4,
  },
];

export const projects: Project[] = [
  {
    id: 1,
    name: 'Hệ thống quản lý đồ án',
    description: 'Một hệ thống giúp sinh viên và giảng viên quản lý đồ án',
    startDate: '2024-01-01',
    endDate: '2024-06-01',
  },
  {
    id: 2,
    name: 'Nghiên cứu AI nhận diện cử chỉ',
    description: 'Phân tích và nhận diện ngôn ngữ ký hiệu từ video',
    startDate: '2024-02-15',
  },
  {
    id: 3,
    name: 'Ứng dụng học tập trực tuyến',
    description: 'Xây dựng nền tảng học tập trực tuyến cho các môn học',
    startDate: '2024-03-01',
    endDate: '2024-08-01',
  },
  {
    id: 4,
    name: 'Dự án website thương mại điện tử',
    description: 'Phát triển một website bán hàng trực tuyến',
    startDate: '2024-04-01',
    endDate: '2024-12-01',
  },
];

export const tasks: Task[] = [
  {
    id: 1,
    title: 'Thiết kế giao diện Dashboard',
    description: 'Tạo giao diện quản lý dự án',
    status: Status.ToDo,
    priority: Priority.High,
    tags: 'UI, React',
    startDate: '2024-01-10',
    dueDate: '2024-02-10',
    points: 5,
    projectId: 1,
    authorUserId: 1,
    assignedUserId: 2,
    author: users[0],
    assignee: users[1],
    attachments: [
      {
        id: 1,
        fileURL:
          'https://th.bing.com/th/id/OIP.5YJ6bFmlxTHjyI5M9Ek7swHaFj?w=224&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        fileName: 'Dashboard Design.png',
        taskId: 1,
        uploadedById: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'Tích hợp API nhận diện cử chỉ',
    description: 'Kết nối hệ thống AI vào backend',
    status: Status.WorkInProgress,
    priority: Priority.Urgent,
    startDate: '2024-03-01',
    dueDate: '2024-04-01',
    points: 8,
    projectId: 2,
    authorUserId: 2,
    assignedUserId: 1,
    author: users[1],
    assignee: users[0],
    attachments: [
      {
        id: 1,
        fileURL:
          'https://th.bing.com/th/id/OIP.YNnsW0lr1tnSgcj9OxH2ZAHaEK?w=286&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        fileName: 'API Integration.png',
        taskId: 2,
        uploadedById: 2,
      },
    ],
  },
  {
    id: 3,
    title: 'Phát triển hệ thống học trực tuyến',
    description: 'Thiết kế và phát triển nền tảng học tập trực tuyến',
    status: Status.ToDo,
    priority: Priority.Medium,
    tags: 'React, Node.js',
    startDate: '2024-03-15',
    dueDate: '2024-06-01',
    points: 6,
    projectId: 3,
    authorUserId: 3,
    assignedUserId: 4,
    author: users[2],
    assignee: users[3],
    attachments: [
      {
        id: 1,
        fileURL:
          'https://th.bing.com/th/id/OIP.lpM8evjnTLWyx3GOlFmKUgHaEU?w=277&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        fileName: 'Learning Platform Design.png',
        taskId: 3,
        uploadedById: 3,
      },
    ],
  },
  {
    id: 4,
    title: 'Phát triển website bán hàng',
    description:
      'Thiết kế giao diện và chức năng cho website bán hàng trực tuyến',
    status: Status.WorkInProgress,
    priority: Priority.Low,
    tags: 'HTML, CSS, JavaScript',
    startDate: '2024-04-05',
    dueDate: '2024-08-01',
    points: 4,
    projectId: 4,
    authorUserId: 4,
    assignedUserId: 2,
    author: users[3],
    assignee: users[1],
    attachments: [],
  },
  // New tasks added
  {
    id: 5,
    title: 'Tạo tài liệu hướng dẫn sử dụng API',
    description: 'Viết tài liệu chi tiết về cách sử dụng API của dự án',
    status: Status.UnderReview,
    priority: Priority.Medium,
    tags: 'Documentation, API',
    startDate: '2024-03-20',
    dueDate: '2024-03-30',
    points: 3,
    projectId: 2,
    authorUserId: 2,
    assignedUserId: 3,
    author: users[1],
    assignee: users[2],
    attachments: [
      {
        id: 1,
        fileURL:
          'https://th.bing.com/th/id/OIP.8hZWw4pBUBL2cPDy0wiONQHaEK?w=286&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        fileName: 'API Documentation.png',
        taskId: 5,
        uploadedById: 2,
      },
    ],
  },
  {
    id: 6,
    title: 'Tối ưu hóa hệ thống học trực tuyến',
    description:
      'Tối ưu hóa hiệu suất hệ thống học trực tuyến để hỗ trợ nhiều người dùng cùng lúc',
    status: Status.ToDo,
    priority: Priority.High,
    tags: 'Optimization, Performance',
    startDate: '2024-04-01',
    dueDate: '2024-06-01',
    points: 7,
    projectId: 3,
    authorUserId: 3,
    assignedUserId: 1,
    author: users[2],
    assignee: users[0],
    attachments: [],
  },
  {
    id: 7,
    title: 'Xây dựng trang thanh toán cho website bán hàng',
    description:
      'Phát triển giao diện và chức năng thanh toán trực tuyến cho website',
    status: Status.WorkInProgress,
    priority: Priority.Urgent,
    tags: 'E-commerce, Payment Gateway',
    startDate: '2024-05-01',
    dueDate: '2024-07-01',
    points: 9,
    projectId: 4,
    authorUserId: 4,
    assignedUserId: 3,
    author: users[3],
    assignee: users[2],
    attachments: [],
  },
];

export const searchResults = {
  tasks: tasks,
  projects: projects,
  users: users,
};

export const mockLecturers = [
  {
    id: '1',
    fullName: 'TS. Nguyễn Văn A',
    facultyCode: 'CS001',
    departmentId: '1',
    rank: 'Giáo sư',
    email: 'nguyenvana@university.edu',
    bio: 'Chuyên về Học máy và Khoa học dữ liệu với hơn 15 năm kinh nghiệm.',
    profilePicture: null,
  },
  {
    id: '2',
    fullName: 'TS. Trần Thị B',
    facultyCode: 'IT002',
    departmentId: '2',
    rank: 'Phó Giáo sư',
    email: 'tranthib@university.edu',
    bio: 'Nghiên cứu tập trung vào an ninh mạng và giao thức mạng.',
    profilePicture: null,
  },
  {
    id: '3',
    fullName: 'GS. Lê Văn C',
    facultyCode: 'SE003',
    departmentId: '3',
    rank: 'Giảng viên',
    email: 'levanc@university.edu',
    bio: 'Chuyên gia về kiến trúc phần mềm và điện toán đám mây.',
    profilePicture: null,
  },
];

export const mockFieldPoolDetail = {
  id: '1',
  name: 'Dự án nghiên cứu AI 2023',
  description:
    'Các dự án nghiên cứu tập trung vào trí tuệ nhân tạo và ứng dụng học máy. Sinh viên sẽ được tiếp cận với các công nghệ mới nhất trong lĩnh vực AI và có cơ hội áp dụng vào các bài toán thực tế.',
  longDescription:
    'Dự án nghiên cứu AI 2023 là một chương trình nghiên cứu toàn diện tập trung vào việc phát triển và ứng dụng các kỹ thuật trí tuệ nhân tạo tiên tiến. Sinh viên tham gia sẽ được tiếp cận với các công nghệ mới nhất trong lĩnh vực AI như học sâu, học tăng cường, xử lý ngôn ngữ tự nhiên và thị giác máy tính.\n\nChương trình này được thiết kế để cung cấp cho sinh viên kinh nghiệm thực tế trong việc giải quyết các vấn đề phức tạp bằng cách sử dụng AI. Sinh viên sẽ làm việc dưới sự hướng dẫn của các giảng viên có chuyên môn cao trong lĩnh vực này và có cơ hội hợp tác với các đối tác công nghiệp để phát triển các giải pháp có tác động thực tế.',
  status: 'OPEN',
  registrationDeadline: '2023-12-15T00:00:00Z',
  maxStudentSelection: 3,
  departments: ['1', '4'],
  domains: ['1', '5'],
  supervisors: [
    {
      lecturerId: '1',
      role: 'Chính',
      status: 'CONFIRMED',
      maxStudents: 5,
      currentStudents: 3,
    },
    {
      lecturerId: '3',
      role: 'Phụ',
      status: 'CONFIRMED',
      maxStudents: 3,
      currentStudents: 1,
    },
    {
      lecturerId: '3',
      role: 'Phụ',
      status: 'CONFIRMED',
      maxStudents: 3,
      currentStudents: 1,
    },
    {
      lecturerId: '3',
      role: 'Phụ',
      status: 'CONFIRMED',
      maxStudents: 3,
      currentStudents: 1,
    },
    {
      lecturerId: '3',
      role: 'Phụ',
      status: 'CONFIRMED',
      maxStudents: 3,
      currentStudents: 1,
    },
    {
      lecturerId: '3',
      role: 'Phụ',
      status: 'CONFIRMED',
      maxStudents: 3,
      currentStudents: 1,
    },
  ],
  totalStudents: 10,
  registeredStudents: 4,
  totalLecturers: 10,
  maxLecturers: 20,
  requirements: [
    'Kiến thức cơ bản về Machine Learning và Deep Learning',
    'Kỹ năng lập trình Python tốt',
    'Đã hoàn thành các môn học liên quan đến AI',
    'Khả năng làm việc độc lập và theo nhóm',
  ],
  outcomes: [
    'Hiểu sâu về các thuật toán AI hiện đại',
    'Kinh nghiệm thực tế trong việc phát triển các ứng dụng AI',
    'Khả năng thiết kế và đánh giá các mô hình học máy',
    'Cơ hội công bố nghiên cứu khoa học',
  ],
  relatedProjects: ['2', '4'],
};

export const mockDomains = [
  { id: '1', name: 'Trí tuệ nhân tạo' },
  { id: '2', name: 'Phát triển Web' },
  { id: '3', name: 'Ứng dụng di động' },
  { id: '4', name: 'An ninh mạng' },
  { id: '5', name: 'Khoa học dữ liệu' },
  { id: '6', name: 'Internet vạn vật (IoT)' },
];

export const mockFieldPools = [
  {
    id: '1',
    name: 'Dự án nghiên cứu AI 2023',
    description:
      'Các dự án nghiên cứu tập trung vào trí tuệ nhân tạo và ứng dụng học máy.',
    status: 'OPEN',
    registrationDeadline: '2023-12-15T00:00:00Z',
    maxStudentSelection: 3,
    departments: ['1', '4'],
    domains: ['1', '5'],
  },
  {
    id: '2',
    name: 'Phát triển Web & Mobile 2023',
    description:
      'Các dự án tập trung vào phát triển ứng dụng web và di động hiện đại sử dụng công nghệ tiên tiến.',
    status: 'OPEN',
    registrationDeadline: '2023-12-10T00:00:00Z',
    maxStudentSelection: 2,
    departments: ['2', '3'],
    domains: ['2', '3'],
  },
  {
    id: '3',
    name: 'Nghiên cứu An ninh mạng 2023',
    description:
      'Các dự án khám phá các khía cạnh khác nhau của an ninh mạng, bảo mật mạng và quyền riêng tư dữ liệu.',
    status: 'OPEN',
    registrationDeadline: '2023-12-20T00:00:00Z',
    maxStudentSelection: 3,
    departments: ['1', '2'],
    domains: ['4'],
  },
  {
    id: '4',
    name: 'IoT và Hệ thống nhúng',
    description:
      'Các dự án tập trung vào thiết bị Internet vạn vật, hệ thống nhúng và ứng dụng của chúng.',
    status: 'OPEN',
    registrationDeadline: '2023-12-18T00:00:00Z',
    maxStudentSelection: 2,
    departments: ['1', '3'],
    domains: ['6'],
  },
];
