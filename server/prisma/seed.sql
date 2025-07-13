-- UTC Research Hub Database Seed Script
-- This SQL script creates initial test data for the UTC Research Hub application
-- It includes faculty, divisions, faculty members, students, projects and evaluations

-- Clear existing data
-- DELETE FROM "notification";
-- DELETE FROM "audit_log"; 
-- DELETE FROM "defense_member";
-- DELETE FROM "defense_committee";
-- DELETE FROM "project_evaluation_score";
-- DELETE FROM "project_evaluation";
-- DELETE FROM "project_report_comment";
-- DELETE FROM "report_attachment";
-- DELETE FROM "project_final_report";
-- DELETE FROM "project_comment";
-- DELETE FROM "project_domain";
-- DELETE FROM "project_member";
-- DELETE FROM "project";
-- DELETE FROM "proposal_outline";
-- DELETE FROM "proposed_project_comment";
-- DELETE FROM "proposed_project_member";
-- DELETE FROM "proposed_project";
-- DELETE FROM "project_allocation";
-- DELETE FROM "student_selection";
-- DELETE FROM "lecturer_selection";
-- DELETE FROM "field_pool_domain";
-- DELETE FROM "field_pool_faculty";
-- DELETE FROM "field_pool";
-- DELETE FROM "domain";
-- DELETE FROM "faculty_membership_division";
-- DELETE FROM "faculty_role";
-- DELETE FROM "faculty_member";
-- DELETE FROM "student";
-- DELETE FROM "faculty_division";
-- DELETE FROM "faculty";
-- DELETE FROM "file";

-- Set constants and create data in a PostgreSQL DO block
DO $$
DECLARE
  DEFAULT_PASSWORD VARCHAR := '$2b$10$4BR920xd4IHuTSaWykT79u.PIziUOBYo4A06vvH37Oe6/6Ju2x9fm';
  FACULTY_CNTT_ID UUID;
  DIV_WEBAPP_ID UUID;
  DIV_AI_ID UUID;
  
  -- Faculty Members IDs
  DEAN_CNTT_ID UUID;
  HEAD_WEBAPP_ID UUID;
  HEAD_AI_ID UUID;
  GV_CNTT_001_ID UUID;
  GV_CNTT_002_ID UUID;
  GV_CNTT_003_ID UUID;
  GV_CNTT_004_ID UUID;
  GV_CNTT_005_ID UUID;
  GV_CNTT_006_ID UUID;
  
  -- Students IDs
  STUDENT1_ID UUID;
  STUDENT2_ID UUID;
  STUDENT3_ID UUID;
  
  -- Domain IDs
  DOMAIN_AI_ID UUID;
  DOMAIN_WEBAPP_ID UUID;
  
  -- FieldPool IDs
  FIELDPOOL_HK1_2425_ID UUID;
  FIELDPOOL_HK2_2425_ID UUID;
  
  -- File IDs
  FILE1_ID UUID;
  FILE2_ID UUID;
  FILE3_ID UUID;
  SAMPLE_PROPOSAL_ID UUID;
  SAMPLE_ATTACHMENT_ID UUID;
  FINAL_REPORT_ID UUID;
  
  -- Project IDs
  PROJECT1_ID UUID;
  PROJECT2_ID UUID;
  PROJECT3_ID UUID;
  PROJECT4_ID UUID;
  PROJECT5_ID UUID;
  
  -- DefenseCommittee ID
  DEFENSE_COMMITTEE_ID UUID;
  DEFENSE_COMMITTEE2_ID UUID;
  FINAL_REPORT_RECORD_ID UUID;
  FINAL_REPORT_RECORD2_ID UUID;
  FINAL_REPORT2_ID UUID;
  
  -- Evaluation ID
  EVALUATION_ID UUID;
  EVALUATION2_ID UUID;

BEGIN
  -- Generate UUIDs for all entities
  FACULTY_CNTT_ID := gen_random_uuid();
  DIV_WEBAPP_ID := gen_random_uuid();
  DIV_AI_ID := gen_random_uuid();
  
  DEAN_CNTT_ID := gen_random_uuid();
  HEAD_WEBAPP_ID := gen_random_uuid();
  HEAD_AI_ID := gen_random_uuid();
  GV_CNTT_001_ID := gen_random_uuid();
  GV_CNTT_002_ID := gen_random_uuid();
  GV_CNTT_003_ID := gen_random_uuid();
  GV_CNTT_004_ID := gen_random_uuid();
  GV_CNTT_005_ID := gen_random_uuid();
  GV_CNTT_006_ID := gen_random_uuid();
  
  STUDENT1_ID := gen_random_uuid();
  STUDENT2_ID := gen_random_uuid();
  STUDENT3_ID := gen_random_uuid();
  
  DOMAIN_AI_ID := gen_random_uuid();
  DOMAIN_WEBAPP_ID := gen_random_uuid();
  
  FIELDPOOL_HK1_2425_ID := gen_random_uuid();
  FIELDPOOL_HK2_2425_ID := gen_random_uuid();
  
  FILE1_ID := gen_random_uuid();
  FILE2_ID := gen_random_uuid();
  FILE3_ID := gen_random_uuid();
  SAMPLE_PROPOSAL_ID := gen_random_uuid();
  SAMPLE_ATTACHMENT_ID := gen_random_uuid();
  FINAL_REPORT_ID := gen_random_uuid();
  
  PROJECT1_ID := gen_random_uuid();
  PROJECT2_ID := gen_random_uuid();
  PROJECT3_ID := gen_random_uuid();
  PROJECT4_ID := gen_random_uuid();
  PROJECT5_ID := gen_random_uuid();
  
  DEFENSE_COMMITTEE_ID := gen_random_uuid();
  DEFENSE_COMMITTEE2_ID := gen_random_uuid();
  FINAL_REPORT_RECORD_ID := gen_random_uuid();
  FINAL_REPORT_RECORD2_ID := gen_random_uuid();
  FINAL_REPORT2_ID := gen_random_uuid();
  
  EVALUATION_ID := gen_random_uuid();
  EVALUATION2_ID := gen_random_uuid();

  -- 1. Create Faculty (CNTT only)
  INSERT INTO "faculty" ("id", "faculty_code", "name", "description", "status", "created_at", "updated_at")
  VALUES (FACULTY_CNTT_ID, 'CNTT', 'Công nghệ Thông tin', 'Khoa Công nghệ Thông tin', 'ACTIVE', NOW(), NOW());
  
  -- 2. Create Divisions (Web/App and AI for CNTT)
  INSERT INTO "faculty_division" ("id", "division_code", "name", "description", "status", "created_at", "updated_at", "faculty_id")
  VALUES 
    (DIV_WEBAPP_ID, 'WEBAPP', 'Phát triển Web/App', 'Bộ môn phát triển ứng dụng Web và Di động', 'ACTIVE', NOW(), NOW(), FACULTY_CNTT_ID),
    (DIV_AI_ID, 'AI', 'Học máy và Trí tuệ Nhân tạo', 'Bộ môn Học máy và Trí tuệ Nhân tạo', 'ACTIVE', NOW(), NOW(), FACULTY_CNTT_ID);

  -- 3. Create Faculty Members
  -- Dean of CNTT
  INSERT INTO "faculty_member" ("id", "faculty_member_code", "full_name", "email", "password", "faculty_id", "rank", "status", "created_at", "updated_at")
  VALUES (DEAN_CNTT_ID, 'DEAN.CNTT', 'GS.TS. Nguyễn Mạnh Hùng', 'nmhung.dean@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Giáo sư, Tiến sĩ', 'ACTIVE', NOW(), NOW());
  
  -- Head of Web/App Division
  INSERT INTO "faculty_member" ("id", "faculty_member_code", "full_name", "email", "password", "faculty_id", "rank", "status", "created_at", "updated_at")
  VALUES (HEAD_WEBAPP_ID, 'HEAD.WEBAPP', 'TS. Đỗ Thanh Hải', 'dthai.head@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Tiến sĩ', 'ACTIVE', NOW(), NOW());
  
  -- Head of AI Division
  INSERT INTO "faculty_member" ("id", "faculty_member_code", "full_name", "email", "password", "faculty_id", "rank", "status", "created_at", "updated_at")
  VALUES (HEAD_AI_ID, 'HEAD.AI', 'PGS.TS. Lê Thị Trưởng Bộ Môn AI', 'head.ai@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Phó Giáo sư, Tiến sĩ', 'ACTIVE', NOW(), NOW());
  
  -- Lecturers for Web/App
  INSERT INTO "faculty_member" ("id", "faculty_member_code", "full_name", "email", "password", "faculty_id", "rank", "status", "created_at", "updated_at")
  VALUES 
    (GV_CNTT_001_ID, 'GV.CNTT.001', 'TS. Nguyễn Thị Lan Anh', 'ntlanh.faculty@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Tiến sĩ', 'ACTIVE', NOW(), NOW()),
    (GV_CNTT_002_ID, 'GV.CNTT.002', 'Giảng viên Web/App 2', 'gv.webapp2@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Thạc sĩ', 'ACTIVE', NOW(), NOW()),
    (GV_CNTT_005_ID, 'GV.CNTT.005', 'Giảng viên Web/App 3', 'gv.webapp3@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Thạc sĩ', 'ACTIVE', NOW(), NOW());
  
  -- Lecturers for AI
  INSERT INTO "faculty_member" ("id", "faculty_member_code", "full_name", "email", "password", "faculty_id", "rank", "status", "created_at", "updated_at")
  VALUES 
    (GV_CNTT_003_ID, 'GV.CNTT.003', 'Giảng viên AI 1', 'gv.ai1@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Tiến sĩ', 'ACTIVE', NOW(), NOW()),
    (GV_CNTT_004_ID, 'GV.CNTT.004', 'Giảng viên AI 2', 'gv.ai2@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Thạc sĩ', 'ACTIVE', NOW(), NOW()),
    (GV_CNTT_006_ID, 'GV.CNTT.006', 'Giảng viên AI 3', 'gv.ai3@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'Tiến sĩ', 'ACTIVE', NOW(), NOW());
    
  -- 4. Assign Faculty Roles
  INSERT INTO "faculty_role" ("id", "faculty_member_id", "role")
  VALUES 
    (gen_random_uuid(), DEAN_CNTT_ID, 'DEAN'),
    (gen_random_uuid(), HEAD_WEBAPP_ID, 'LECTURER'),
    (gen_random_uuid(), HEAD_AI_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_001_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_002_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_003_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_004_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_005_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_006_ID, 'LECTURER');
    
  -- 5. Assign Faculty Members to Divisions
  INSERT INTO "faculty_membership_division" ("id", "faculty_member_id", "division_id", "role")
  VALUES
    (gen_random_uuid(), DEAN_CNTT_ID, DIV_WEBAPP_ID, 'LECTURER'),
    (gen_random_uuid(), HEAD_WEBAPP_ID, DIV_WEBAPP_ID, 'HEAD'),
    (gen_random_uuid(), HEAD_AI_ID, DIV_AI_ID, 'HEAD'),
    (gen_random_uuid(), GV_CNTT_001_ID, DIV_WEBAPP_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_002_ID, DIV_WEBAPP_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_005_ID, DIV_WEBAPP_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_003_ID, DIV_AI_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_004_ID, DIV_AI_ID, 'LECTURER'),
    (gen_random_uuid(), GV_CNTT_006_ID, DIV_AI_ID, 'LECTURER');
    
  -- 6. Create Students
  -- Students for Web/App
  INSERT INTO "student" ("id", "student_code", "full_name", "email", "password", "faculty_id", "status", "admission_year", "current_gpa", "gender", "date_of_birth", "created_at", "updated_at")
  VALUES 
    (STUDENT1_ID, 'SV.CNTT.WA.001', 'Sinh viên Web/App 1', 'sv.webapp1@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.5, 'MALE', '2003-01-01', NOW(), NOW()),
    (STUDENT2_ID, 'SV.CNTT.WA.002', 'Sinh viên Web/App 2', 'sv.webapp2@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.2, 'FEMALE', '2004-02-02', NOW(), NOW()),
    (STUDENT3_ID, 'SV.CNTT.WA.003', 'Sinh viên Web/App 3', 'sv.webapp3@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2023, 3.8, 'MALE', '2005-03-03', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.004', 'Sinh viên Web/App 4', 'sv.webapp4@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.1, 'FEMALE', '2003-04-04', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.005', 'Sinh viên Web/App 5', 'sv.webapp5@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.4, 'MALE', '2004-05-05', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.006', 'Nguyễn Văn A', 'nguyenvana@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.7, 'MALE', '2003-06-15', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.007', 'Trần Thị B', 'tranthib@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.9, 'FEMALE', '2003-07-22', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.008', 'Lê Văn C', 'levanc@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.5, 'MALE', '2004-03-10', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.009', 'Phạm Thị D', 'phamthid@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.6, 'FEMALE', '2004-11-05', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.WA.010', 'Hoàng Văn E', 'hoangvane@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2023, 3.4, 'MALE', '2005-01-30', NOW(), NOW());

  -- Students for AI
  INSERT INTO "student" ("id", "student_code", "full_name", "email", "password", "faculty_id", "status", "admission_year", "current_gpa", "gender", "date_of_birth", "created_at", "updated_at")
  VALUES 
    (gen_random_uuid(), 'SV.CNTT.AI.001', 'Sinh viên AI 1', 'sv.ai1@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.6, 'MALE', '2003-06-06', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.002', 'Sinh viên AI 2', 'sv.ai2@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.3, 'FEMALE', '2004-07-07', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.003', 'Sinh viên AI 3', 'sv.ai3@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2023, 3.7, 'MALE', '2005-08-08', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.004', 'Sinh viên AI 4', 'sv.ai4@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.0, 'FEMALE', '2003-09-09', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.005', 'Sinh viên AI 5', 'sv.ai5@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.9, 'MALE', '2004-10-10', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.006', 'Đỗ Minh F', 'dominhf@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.8, 'MALE', '2003-04-18', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.007', 'Vũ Thị G', 'vuthig@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2021, 3.5, 'FEMALE', '2003-12-25', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.008', 'Ngô Văn H', 'ngovanh@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.7, 'MALE', '2004-06-30', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.009', 'Bùi Thị I', 'buithii@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2022, 3.9, 'FEMALE', '2004-09-15', NOW(), NOW()),
    (gen_random_uuid(), 'SV.CNTT.AI.010', 'Đặng Văn K', 'dangvank@utc.edu.vn', DEFAULT_PASSWORD, FACULTY_CNTT_ID, 'ACTIVE', 2023, 3.6, 'MALE', '2005-05-20', NOW(), NOW());

  -- 7. Create Domains and Field Pools
  INSERT INTO "domain" ("id", "name", "description")
  VALUES
    (DOMAIN_AI_ID, 'Trí tuệ Nhân tạo', 'Lĩnh vực Trí tuệ Nhân tạo và Học máy'),
    (DOMAIN_WEBAPP_ID, 'Phát triển Web/App', 'Lĩnh vực Phát triển ứng dụng Web và Di động');


  INSERT INTO "field_pool" ("id", "name", "description", "status", "created_at", "updated_at", "registration_deadline")
  VALUES
    (FIELDPOOL_HK1_2425_ID, 'Đợt ĐK Đồ án HK1 Năm 2024-2025 (CNTT)', 'Đợt đăng ký đồ án cho học kỳ 1 năm học 2024-2025 - Khoa CNTT', 'OPEN', NOW(), NOW(), '2025-09-15 23:59:59'),
    (FIELDPOOL_HK2_2425_ID, 'Đợt ĐK Đồ án HK2 Năm 2024-2025 (CNTT)', 'Đợt đăng ký đồ án cho học kỳ 2 năm học 2024-2025 - Khoa CNTT', 'CLOSED', NOW(), NOW(), '2025-02-15 23:59:59');

  INSERT INTO "field_pool_domain" ("field_pool_id", "domain_id")
  VALUES
    (FIELDPOOL_HK1_2425_ID, DOMAIN_AI_ID),
    (FIELDPOOL_HK1_2425_ID, DOMAIN_WEBAPP_ID),
    (FIELDPOOL_HK2_2425_ID, DOMAIN_AI_ID),
    (FIELDPOOL_HK2_2425_ID, DOMAIN_WEBAPP_ID);
    
  INSERT INTO "field_pool_faculty" ("field_pool_id", "faculty_id")
  VALUES
    (FIELDPOOL_HK1_2425_ID, FACULTY_CNTT_ID),
    (FIELDPOOL_HK2_2425_ID, FACULTY_CNTT_ID);

  -- 8. Create Files
  
  -- Basic files
  INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
  VALUES
    (FILE1_ID, 'proposal_outline_gen1_12345.pdf', 'Đề cương mẫu chung 1.pdf', '/uploads/proposal/sample.pdf', 'PDF', 'application/pdf', 1200, FALSE, STUDENT1_ID, NOW()),
    (FILE2_ID, 'proposal_outline_gen2_67890.docx', 'Đề cương mẫu chung 2.docx', '/uploads/proposal/sample.docx', 'WORD', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1800, FALSE, STUDENT2_ID, NOW()),
    (FILE3_ID, 'report_gen1_13579.pdf', 'Báo cáo mẫu chung 1.pdf', '/uploads/report/sample.pdf', 'PDF', 'application/pdf', 5000, FALSE, STUDENT1_ID, NOW());
  
  -- Add the specific files mentioned by the user
  INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
  VALUES
    (SAMPLE_PROPOSAL_ID, 'sample_proposal.pdf', 'Đề cương mẫu chi tiết.pdf', '/uploads/proposal/sample.pdf', 'PDF', 'application/pdf', 2500, FALSE, STUDENT1_ID, NOW()),
    (SAMPLE_ATTACHMENT_ID, 'sample_attachment.pdf', 'Tài liệu đính kèm mẫu.pdf', '/uploads/attachment/sample.pdf', 'PDF', 'application/pdf', 1800, FALSE, STUDENT1_ID, NOW()),
    (FINAL_REPORT_ID, 'final_report_sv1_0197_01974e41-a296-7484-b8c8-56d54fdba5a1.pdf', 'Báo cáo tốt nghiệp cuối cùng.pdf', '/uploads/report/sample.pdf', 'PDF', 'application/pdf', 8500, FALSE, STUDENT1_ID, NOW());
  
  -- 9. Create Project Allocations
  INSERT INTO "project_allocation" ("id", "topic_title", "status", "student_id", "lecturer_id", "created_by_id", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), 'Đề tài Phân công Đặc Biệt cho SV1 với GV1 - AI Project', 'APPROVED', STUDENT1_ID, GV_CNTT_001_ID, GV_CNTT_001_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Đề tài Phân công SV.CNTT.WA.002 2 - Data Mining', 'APPROVED', STUDENT2_ID, GV_CNTT_002_ID, GV_CNTT_002_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Đề tài Phân công SV.CNTT.WA.003 3 - UX/UI Design', 'PENDING', STUDENT3_ID, GV_CNTT_003_ID, GV_CNTT_003_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Đề tài Phân công SV.CNTT.AI.001 4 - System Architecture', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.001'), GV_CNTT_004_ID, GV_CNTT_004_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Phát triển ứng dụng IoT kết nối với Cloud', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.008'), GV_CNTT_001_ID, GV_CNTT_001_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Nghiên cứu giải pháp bảo mật cho ứng dụng web', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.009'), HEAD_WEBAPP_ID, DEAN_CNTT_ID, NOW(), NOW());
  
  -- 10. Create some Projects in different states
  -- Project 1 - WAITING_FOR_EVALUATION status
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES (
    PROJECT1_ID,
    'GRADUATED',
    'Phát triển ứng dụng Web sử dụng React và GraphQL',
    'Xây dựng ứng dụng web với ReactJS, NextJS phía frontend và GraphQL phía backend',
    'Phát triển Web/App',
    'WAITING_FOR_EVALUATION',
    HEAD_WEBAPP_ID,
    FIELDPOOL_HK1_2425_ID,
    DIV_WEBAPP_ID,
    NOW(),
    NOW()
  );
  
  -- Project 2 - IN_PROGRESS status
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES (
    PROJECT2_ID,
    'GRADUATED',
    'Xây dựng mô hình học máy cho bài toán phân loại hình ảnh y tế',
    'Phát triển mô hình AI để phân loại hình ảnh X-quang phổi',
    'Trí tuệ Nhân tạo',
    'IN_PROGRESS',
    HEAD_AI_ID,
    FIELDPOOL_HK1_2425_ID,
    DIV_AI_ID,
    NOW(),
    NOW()
  );
  
  -- Add members to projects
  INSERT INTO "project_member" ("id", "project_id", "student_id", "faculty_member_id", "role", "status")
  VALUES
    (gen_random_uuid(), PROJECT1_ID, STUDENT1_ID, NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), PROJECT1_ID, NULL, GV_CNTT_001_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), PROJECT2_ID, STUDENT2_ID, NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), PROJECT2_ID, NULL, GV_CNTT_003_ID, 'ADVISOR', 'ACTIVE');
  
  -- Add report for project 1 using the actual final report file
  INSERT INTO "project_final_report" ("id", "project_id", "main_report_file_id", "student_id", "submitted_at", "updated_at")
  VALUES (FINAL_REPORT_RECORD_ID, PROJECT1_ID, FINAL_REPORT_ID, STUDENT1_ID, NOW(), NOW());
  
  -- Add attachments to the final report
  INSERT INTO "report_attachment" ("id", "report_id", "file_id", "added_at")
  VALUES 
    (gen_random_uuid(), FINAL_REPORT_RECORD_ID, SAMPLE_ATTACHMENT_ID, NOW()),
    (gen_random_uuid(), FINAL_REPORT_RECORD_ID, SAMPLE_PROPOSAL_ID, NOW());
  
  -- 11. Create Defense Committee
  INSERT INTO "defense_committee" ("id", "name", "description", "project_id", "created_by_id", "status", "defense_date", "location", "created_at", "updated_at")
  VALUES (
    DEFENSE_COMMITTEE_ID,
    'Hội đồng đánh giá đồ án React và GraphQL',
    'Hội đồng chấm đồ án phát triển ứng dụng Web',
    PROJECT1_ID,
    DEAN_CNTT_ID,
    'SCHEDULED',
    (NOW() + INTERVAL '7 days'),
    'Phòng H101',
    NOW(),
    NOW()
  );
  
  -- Add members to committee
  INSERT INTO "defense_committee_member" ("id", "defense_committee_id", "faculty_member_id", "role")
  VALUES
    (gen_random_uuid(), DEFENSE_COMMITTEE_ID, DEAN_CNTT_ID, 'CHAIRMAN'),
    (gen_random_uuid(), DEFENSE_COMMITTEE_ID, HEAD_WEBAPP_ID, 'SECRETARY'),
    (gen_random_uuid(), DEFENSE_COMMITTEE_ID, GV_CNTT_002_ID, 'MEMBER'),
    (gen_random_uuid(), DEFENSE_COMMITTEE_ID, GV_CNTT_005_ID, 'MEMBER');
  
  -- Create proposed projects for student 1
  INSERT INTO "proposed_project" ("id", "title", "description", "status", "created_at", "updated_at")
  VALUES 
    (gen_random_uuid(), 'Phát triển ứng dụng quản lý hoạt động ngoại khóa cho sinh viên', 'Xây dựng hệ thống quản lý các hoạt động ngoại khóa, tích hợp chức năng đăng ký, điểm danh và chứng nhận tham gia cho sinh viên', 'TOPIC_PENDING_ADVISOR', NOW(), NOW()),
    (gen_random_uuid(), 'Ứng dụng AI hỗ trợ sinh viên học tiếng Anh chuyên ngành CNTT', 'Phát triển chatbot tích hợp với công nghệ AI để hỗ trợ sinh viên học và luyện tập tiếng Anh chuyên ngành Công nghệ thông tin', 'TOPIC_APPROVED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), 'Hệ thống theo dõi và phân tích thói quen học tập của sinh viên', 'Xây dựng hệ thống phân tích dữ liệu học tập của sinh viên để đưa ra gợi ý cải thiện hiệu quả học tập', 'OUTLINE_PENDING_ADVISOR', NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú', 'Xây dựng nền tảng cho phép sinh viên lưu trữ, tổ chức và chia sẻ tài liệu học tập và ghi chú theo môn học', 'OUTLINE_REQUESTED_CHANGES', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days');

  -- Add student 1 as member of the proposed projects
  INSERT INTO "proposed_project_member" ("id", "proposed_project_id", "student_id", "faculty_member_id", "role", "status")
  VALUES
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Phát triển ứng dụng quản lý hoạt động ngoại khóa cho sinh viên'), STUDENT1_ID, NULL, 'OWNER', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Phát triển ứng dụng quản lý hoạt động ngoại khóa cho sinh viên'), NULL, GV_CNTT_001_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng AI hỗ trợ sinh viên học tiếng Anh chuyên ngành CNTT'), STUDENT1_ID, NULL, 'OWNER', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng AI hỗ trợ sinh viên học tiếng Anh chuyên ngành CNTT'), NULL, GV_CNTT_003_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Hệ thống theo dõi và phân tích thói quen học tập của sinh viên'), STUDENT1_ID, NULL, 'OWNER', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Hệ thống theo dõi và phân tích thói quen học tập của sinh viên'), NULL, GV_CNTT_002_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú'), STUDENT1_ID, NULL, 'OWNER', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE');

  -- Add comments for one of the proposed projects
  INSERT INTO "proposed_project_comment" ("id", "content", "proposed_project_id", "commenter_faculty_id", "commenter_student_id", "created_at")
  VALUES
    (gen_random_uuid(), 'Đề tài rất thú vị, nhưng cần làm rõ thêm về phương pháp triển khai và công nghệ sẽ sử dụng.', (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú'), HEAD_WEBAPP_ID, NULL, NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), 'Em đã cập nhật thêm phần công nghệ dự kiến sử dụng là React với NextJS cho frontend và PostgreSQL + Prisma cho backend.', (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú'), NULL, STUDENT1_ID, NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), 'Cần bổ sung thêm phần bảo mật dữ liệu và quyền riêng tư của người dùng.', (SELECT id FROM "proposed_project" WHERE "title" = 'Ứng dụng quản lý tài liệu học tập và chia sẻ ghi chú'), HEAD_WEBAPP_ID, NULL, NOW() - INTERVAL '10 days');

  -- 12. Create Evaluation for project 1
  EVALUATION_ID := gen_random_uuid();
  
  -- Insert project evaluation with the predefined ID
  INSERT INTO "project_evaluation" ("id", "project_id", "status", "advisor_weight", "committee_weight", "created_at", "updated_at")
  VALUES (EVALUATION_ID, PROJECT1_ID, 'PENDING', 0.4, 0.6, NOW(), NOW());
  
  -- Advisor score - use the predefined evaluation_id directly
  INSERT INTO "project_evaluation_score" ("id", "evaluation_id", "evaluator_id", "role", "score", "comment", "created_at", "updated_at")
  VALUES (
    gen_random_uuid(), 
    EVALUATION_ID, 
    GV_CNTT_001_ID, 
    'ADVISOR', 
    9.0,
    'Sinh viên đã thực hiện tốt đồ án, có hiểu biết sâu về React và GraphQL',
    NOW(),
    NOW()
  );
  
  -- Committee member score - use the predefined evaluation_id directly
  INSERT INTO "project_evaluation_score" ("id", "evaluation_id", "evaluator_id", "role", "score", "comment", "created_at", "updated_at")
  VALUES (
    gen_random_uuid(), 
    EVALUATION_ID, 
    DEAN_CNTT_ID, 
    'COMMITTEE', 
    8.5,
    'Đồ án có tính ứng dụng cao, nhưng cần cải thiện một số vấn đề về bảo mật',
    NOW(),
    NOW()
  );
  
  -- Add more project allocations
  INSERT INTO "project_allocation" ("id", "topic_title", "status", "student_id", "lecturer_id", "created_by_id", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), 'Xây dựng ứng dụng di động sử dụng React Native', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), GV_CNTT_001_ID, DEAN_CNTT_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Ứng dụng trí tuệ nhân tạo trong phát hiện gian lận thi cử', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), HEAD_AI_ID, HEAD_AI_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Xây dựng hệ thống quản lý đề tài nghiên cứu khoa học', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.007'), HEAD_WEBAPP_ID, DEAN_CNTT_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Phát triển hệ thống quản lý học tập trực tuyến', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), GV_CNTT_001_ID, GV_CNTT_001_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Nghiên cứu các kỹ thuật tối ưu hóa cơ sở dữ liệu', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.010'), GV_CNTT_001_ID, DEAN_CNTT_ID, NOW(), NOW());
  
  -- Create more projects in different states
  -- Project 3 - IN_PROGRESS status
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES (
    PROJECT3_ID,
    'RESEARCH',
    'Ứng dụng Blockchain trong hệ thống cấp bằng số',
    'Nghiên cứu và phát triển hệ thống cấp bằng số sử dụng công nghệ Blockchain để đảm bảo tính toàn vẹn và chống giả mạo',
    'Phát triển Web/App',
    'IN_PROGRESS',
    HEAD_WEBAPP_ID,
    FIELDPOOL_HK1_2425_ID,
    DIV_WEBAPP_ID,
    NOW(),
    NOW()
  );
  
  -- Project 4 - IN_PROGRESS status
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES (
    PROJECT4_ID,
    'GRADUATED',
    'Phát triển ứng dụng nhận diện khuôn mặt cho điểm danh',
    'Xây dựng ứng dụng di động sử dụng thuật toán nhận diện khuôn mặt để tự động điểm danh sinh viên trong lớp học',
    'Trí tuệ Nhân tạo',
    'IN_PROGRESS',
    HEAD_AI_ID,
    FIELDPOOL_HK1_2425_ID,
    DIV_AI_ID,
    NOW(),
    NOW()
  );
  
  -- Project 5 - WAITING_FOR_EVALUATION status
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES (
    PROJECT5_ID,
    'RESEARCH',
    'Phân tích dữ liệu lớn trong giao thông',
    'Nghiên cứu phương pháp xử lý dữ liệu lớn để phân tích và dự báo tình hình giao thông đô thị',
    'Trí tuệ Nhân tạo',
    'WAITING_FOR_EVALUATION',
    HEAD_AI_ID,
    FIELDPOOL_HK1_2425_ID,
    DIV_AI_ID,
    NOW(),
    NOW()
  );
  
  -- Add members to new projects
  INSERT INTO "project_member" ("id", "project_id", "student_id", "faculty_member_id", "role", "status")
  VALUES
    (gen_random_uuid(), PROJECT3_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), PROJECT3_ID, NULL, GV_CNTT_002_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), PROJECT4_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.007'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), PROJECT4_ID, NULL, GV_CNTT_003_ID, 'ADVISOR', 'ACTIVE'),
    (gen_random_uuid(), PROJECT5_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.008'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), PROJECT5_ID, NULL, HEAD_AI_ID, 'ADVISOR', 'ACTIVE');
  
  -- Add defense committee for PROJECT5_ID
  INSERT INTO "defense_committee" ("id", "name", "description", "project_id", "created_by_id", "status", "defense_date", "location", "created_at", "updated_at")
  VALUES (
    DEFENSE_COMMITTEE2_ID,
    'Hội đồng đánh giá đề tài phân tích dữ liệu giao thông',
    'Hội đồng chấm đề tài nghiên cứu về phân tích dữ liệu lớn trong giao thông',
    PROJECT5_ID,
    DEAN_CNTT_ID,
    'SCHEDULED',
    (NOW() + INTERVAL '14 days'),
    'Phòng H102',
    NOW(),
    NOW()
  );
  
  -- Add members to new defense committee
  INSERT INTO "defense_committee_member" ("id", "defense_committee_id", "faculty_member_id", "role")
  VALUES
    (gen_random_uuid(), DEFENSE_COMMITTEE2_ID, HEAD_AI_ID, 'CHAIRMAN'),
    (gen_random_uuid(), DEFENSE_COMMITTEE2_ID, GV_CNTT_004_ID, 'SECRETARY'),
    (gen_random_uuid(), DEFENSE_COMMITTEE2_ID, GV_CNTT_006_ID, 'MEMBER'),
    (gen_random_uuid(), DEFENSE_COMMITTEE2_ID, GV_CNTT_001_ID, 'MEMBER');
  
  -- Create evaluation for PROJECT5_ID
  INSERT INTO "project_evaluation" ("id", "project_id", "status", "advisor_weight", "committee_weight", "created_at", "updated_at")
  VALUES (EVALUATION2_ID, PROJECT5_ID, 'PENDING', 0.4, 0.6, NOW(), NOW());
  
  -- Add evaluation scores
  INSERT INTO "project_evaluation_score" ("id", "evaluation_id", "evaluator_id", "role", "score", "comment", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), EVALUATION2_ID, HEAD_AI_ID, 'ADVISOR', 9.5, 'Đề tài có tính ứng dụng cao và phương pháp nghiên cứu chặt chẽ', NOW(), NOW()),
    (gen_random_uuid(), EVALUATION2_ID, GV_CNTT_004_ID, 'COMMITTEE', 9.0, 'Trình bày rõ ràng, có hiểu biết sâu về xử lý dữ liệu lớn', NOW(), NOW()),
    (gen_random_uuid(), EVALUATION2_ID, GV_CNTT_006_ID, 'COMMITTEE', 8.5, 'Kết quả nghiên cứu khả quan, cần cải thiện phần đánh giá hiệu năng', NOW(), NOW()),
    (gen_random_uuid(), EVALUATION2_ID, GV_CNTT_001_ID, 'COMMITTEE', 9.0, 'Sản phẩm demo hoạt động tốt, tài liệu rõ ràng', NOW(), NOW());
  
  -- Add sample file for final report of PROJECT5_ID
  INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
  VALUES (FINAL_REPORT2_ID, 'final_report_bigdata_traffic_analysis.pdf', 'Báo cáo phân tích dữ liệu giao thông.pdf', '/uploads/report/sample2.pdf', 'PDF', 'application/pdf', 7800, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.008'), NOW());
  
  -- Add final report record for PROJECT5_ID
  INSERT INTO "project_final_report" ("id", "project_id", "main_report_file_id", "student_id", "submitted_at", "updated_at")
  VALUES (FINAL_REPORT_RECORD2_ID, PROJECT5_ID, FINAL_REPORT2_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.008'), NOW(), NOW());
  
  -- Add some project comments
  INSERT INTO "project_comment" ("id", "content", "project_id", "commenter_faculty_member_id", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), 'Tiến độ dự án đang rất tốt, cần chú ý thêm về phần testing', PROJECT3_ID, GV_CNTT_002_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Đã xem báo cáo tiến độ, cần làm rõ hơn phương pháp nghiên cứu', PROJECT4_ID, GV_CNTT_003_ID, NOW(), NOW()),
    (gen_random_uuid(), 'Đã hoàn thành tốt các yêu cầu, đề nghị chuẩn bị báo cáo cuối kỳ', PROJECT5_ID, HEAD_AI_ID, NOW(), NOW());
  
  INSERT INTO "project_comment" ("id", "content", "project_id", "commenter_student_id", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), 'Em đã cập nhật phần testing theo góp ý của thầy', PROJECT3_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NOW(), NOW()),
    (gen_random_uuid(), 'Em đã bổ sung chi tiết phương pháp nghiên cứu trong báo cáo mới', PROJECT4_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.007'), NOW(), NOW());
  
  -- Add more specific information for key faculty members
  
  -- Update Dean of CNTT with more detailed information
  UPDATE "faculty_member" 
  SET 
    "full_name" = 'GS.TS. Nguyễn Mạnh Hùng',
    "email" = 'nmhung.dean@utc.edu.vn',
    "bio" = 'Giáo sư, Tiến sĩ chuyên ngành Khoa học máy tính. Có hơn 25 năm kinh nghiệm giảng dạy và nghiên cứu. Tốt nghiệp Tiến sĩ tại Đại học Quốc gia Singapore năm 2002.',
    "phone_number" = '0912345678',
    "rank" = 'Giáo sư, Tiến sĩ'
  WHERE "id"::TEXT = DEAN_CNTT_ID::TEXT;
  
  -- Update Head of Web/App Division with more information
  UPDATE "faculty_member" 
  SET 
    "full_name" = 'TS. Đỗ Thanh Hải',
    "email" = 'dthai.head@utc.edu.vn',
    "bio" = 'Tiến sĩ chuyên ngành Công nghệ Web và Hệ thống thông tin. Tốt nghiệp Tiến sĩ tại Đại học Kỹ thuật Chemnitz, Đức năm 2015. Có nhiều công trình nghiên cứu về phát triển ứng dụng Web hiện đại.',
    "phone_number" = '0923456789',
    "rank" = 'Tiến sĩ'
  WHERE "id"::TEXT = HEAD_WEBAPP_ID::TEXT;
  
  -- Update GV_CNTT_001 with more information
  UPDATE "faculty_member" 
  SET 
    "full_name" = 'TS. Nguyễn Thị Lan Anh',
    "email" = 'ntlanh.faculty@utc.edu.vn',
    "bio" = 'Tiến sĩ chuyên ngành Công nghệ phần mềm. Tốt nghiệp Tiến sĩ tại Đại học Quốc gia Hà Nội năm 2018. Chuyên gia về React và GraphQL, có nhiều năm kinh nghiệm làm việc trong ngành công nghiệp phần mềm.',
    "phone_number" = '0934567890',
    "rank" = 'Tiến sĩ'
  WHERE "id"::TEXT = GV_CNTT_001_ID::TEXT;
  
  -- Create some student selections for the additional students
  INSERT INTO "student_selection" ("id", "priority", "topic_title", "description", "status", "student_id", "lecturer_id", "field_pool_id", "preferred_at", "created_at", "updated_at")
  VALUES 
    (gen_random_uuid(), 1, 'Xây dựng ứng dụng di động sử dụng React Native', 'Phát triển ứng dụng di động đa nền tảng với React Native và Firebase', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Ứng dụng trí tuệ nhân tạo trong phát hiện gian lận thi cử', 'Sử dụng các kỹ thuật học máy để phát hiện hành vi gian lận trong kỳ thi trực tuyến', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Xây dựng hệ thống quản lý đề tài nghiên cứu khoa học', 'Phát triển ứng dụng web để quản lý các đề tài nghiên cứu khoa học của sinh viên', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.007'), HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW());
  
  -- Add more project selections for students
  INSERT INTO "student_selection" ("id", "priority", "topic_title", "description", "status", "student_id", "lecturer_id", "field_pool_id", "preferred_at", "created_at", "updated_at")
  VALUES 
    -- More selections for existing students
    (gen_random_uuid(), 2, 'Phát triển hệ thống quản lý kho hàng thông minh', 'Sử dụng IoT và AI để quản lý kho hàng tự động', 'PENDING', STUDENT1_ID, GV_CNTT_002_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 2, 'Xây dựng chatbot tư vấn học tập', 'Chatbot sử dụng NLP để hỗ trợ sinh viên trong quá trình học tập', 'APPROVED', STUDENT2_ID, GV_CNTT_003_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 2, 'Nghiên cứu giải pháp dự đoán điểm học tập', 'Sử dụng Machine Learning để dự đoán kết quả học tập của sinh viên', 'PENDING', STUDENT3_ID, GV_CNTT_004_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    
    -- Selections for additional students
    (gen_random_uuid(), 1, 'Xây dựng ứng dụng nhận diện khuôn mặt cho điểm danh', 'Ứng dụng mobile sử dụng AI để điểm danh lớp học', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.007'), GV_CNTT_003_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Nghiên cứu phương pháp xác thực đa yếu tố', 'Xây dựng giải pháp xác thực bảo mật đa lớp cho ứng dụng web', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.010'), HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Phân tích dữ liệu lớn trong giao thông', 'Sử dụng Big Data để phân tích và dự báo tình hình giao thông', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.008'), HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Phát triển hệ thống quản lý học tập trực tuyến', 'Xây dựng LMS với các tính năng tương tác và theo dõi tiến độ', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 1, 'Ứng dụng Blockchain trong hệ thống cấp bằng số', 'Nghiên cứu và phát triển hệ thống cấp bằng số sử dụng công nghệ Blockchain', 'APPROVED', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), GV_CNTT_002_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    
    -- Second priority selections
    (gen_random_uuid(), 2, 'Xây dựng hệ thống tự động phát hiện đạo văn', 'Phát triển thuật toán so sánh văn bản để phát hiện đạo văn', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.008'), GV_CNTT_004_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 2, 'Phát triển game giáo dục với Unity', 'Xây dựng game giáo dục về lập trình cho trẻ em', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.009'), GV_CNTT_005_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW()),
    (gen_random_uuid(), 2, 'Nghiên cứu các kỹ thuật tối ưu hóa cơ sở dữ liệu', 'Phân tích và áp dụng các kỹ thuật tối ưu hóa truy vấn CSDL', 'PENDING', (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.010'), GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, NOW(), NOW(), NOW());
  
  -- 13. Create Lecturer Selections (Giảng viên đăng ký tham gia hướng dẫn)
  INSERT INTO "lecturer_selection" ("id", "lecturer_id", "field_pool_id", "capacity", "current_capacity", "status", "created_at", "updated_at")
  VALUES
    -- Lecturer selections for HK1 2024-2025
    (gen_random_uuid(), DEAN_CNTT_ID, FIELDPOOL_HK1_2425_ID, 3, 1, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, 4, 2, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, 3, 2, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, 5, 3, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_002_ID, FIELDPOOL_HK1_2425_ID, 4, 2, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_003_ID, FIELDPOOL_HK1_2425_ID, 3, 2, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_004_ID, FIELDPOOL_HK1_2425_ID, 2, 1, 'PENDING', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_005_ID, FIELDPOOL_HK1_2425_ID, 3, 0, 'APPROVED', NOW(), NOW()),
    (gen_random_uuid(), GV_CNTT_006_ID, FIELDPOOL_HK1_2425_ID, 2, 0, 'PENDING', NOW(), NOW()),
    
    -- Lecturer selections for HK2 2024-2025 (closed period)
    (gen_random_uuid(), DEAN_CNTT_ID, FIELDPOOL_HK2_2425_ID, 2, 0, 'APPROVED', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), HEAD_WEBAPP_ID, FIELDPOOL_HK2_2425_ID, 3, 0, 'APPROVED', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), GV_CNTT_001_ID, FIELDPOOL_HK2_2425_ID, 4, 0, 'APPROVED', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), GV_CNTT_002_ID, FIELDPOOL_HK2_2425_ID, 3, 0, 'REJECTED', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), GV_CNTT_003_ID, FIELDPOOL_HK2_2425_ID, 2, 0, 'APPROVED', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months');

  -- 14. Create more projects in different states, especially COMPLETED projects waiting for defense committees
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES 
    -- Projects COMPLETED and waiting for defense committee creation
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống quản lý thư viện số thông minh', 'Xây dựng hệ thống quản lý thư viện với tính năng tìm kiếm thông minh và gợi ý sách', 'Phát triển Web/App', 'COMPLETED', HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 week'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng nhận diện biển số xe thông minh', 'Phát triển ứng dụng sử dụng computer vision để nhận diện và quản lý biển số xe', 'Trí tuệ Nhân tạo', 'COMPLETED', HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '2 months', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'RESEARCH', 'Nghiên cứu thuật toán tối ưu hóa lịch học', 'Phát triển thuật toán genetic để tối ưu hóa việc xếp lịch học cho trường đại học', 'Trí tuệ Nhân tạo', 'COMPLETED', HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống e-commerce với microservices', 'Xây dựng hệ thống thương mại điện tử sử dụng kiến trúc microservices', 'Phát triển Web/App', 'COMPLETED', HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng phân tích cảm xúc từ văn bản', 'Phát triển ứng dụng sử dụng NLP để phân tích cảm xúc từ bình luận và đánh giá', 'Trí tuệ Nhân tạo', 'COMPLETED', GV_CNTT_003_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '1 month', NOW()),
    
    -- More projects in IN_PROGRESS state
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống quản lý bệnh viện tích hợp IoT', 'Xây dựng hệ thống quản lý bệnh viện với các thiết bị IoT để theo dõi bệnh nhân', 'Phát triển Web/App', 'IN_PROGRESS', GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '4 months', NOW()),
    (gen_random_uuid(), 'RESEARCH', 'Nghiên cứu mô hình deep learning cho dự báo thời tiết', 'Phát triển mô hình AI để dự báo thời tiết chính xác cho khu vực miền Bắc', 'Trí tuệ Nhân tạo', 'IN_PROGRESS', GV_CNTT_004_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '3 months', NOW()),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng quản lý tài chính cá nhân', 'Phát triển ứng dụng mobile để quản lý thu chi và lập kế hoạch tài chính cá nhân', 'Phát triển Web/App', 'IN_PROGRESS', GV_CNTT_002_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '2 months', NOW()),
    (gen_random_uuid(), 'COMPETITION', 'Hệ thống thi đấu lập trình trực tuyến', 'Xây dựng nền tảng thi đấu lập trình với tính năng chấm bài tự động', 'Phát triển Web/App', 'IN_PROGRESS', HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '1 month', NOW()),
    
    -- Projects ON_HOLD
    (gen_random_uuid(), 'RESEARCH', 'Nghiên cứu blockchain trong bỏ phiếu điện tử', 'Phát triển hệ thống bỏ phiếu điện tử an toàn sử dụng công nghệ blockchain', 'Phát triển Web/App', 'ON_HOLD', DEAN_CNTT_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '5 months', NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng AR/VR cho giáo dục', 'Phát triển ứng dụng thực tế ảo và thực tế tăng cường phục vụ giảng dạy', 'Trí tuệ Nhân tạo', 'ON_HOLD', GV_CNTT_006_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '4 months', NOW() - INTERVAL '2 weeks');

  -- Add members to the new projects
  INSERT INTO "project_member" ("id", "project_id", "student_id", "faculty_member_id", "role", "status")
  VALUES
    -- Members for completed projects waiting for defense
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), NULL, HEAD_AI_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán tối ưu hóa lịch học'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.009'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán tối ưu hóa lịch học'), NULL, HEAD_AI_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống e-commerce với microservices'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.007'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống e-commerce với microservices'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng phân tích cảm xúc từ văn bản'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.010'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng phân tích cảm xúc từ văn bản'), NULL, GV_CNTT_003_ID, 'ADVISOR', 'ACTIVE'),
    
    -- Members for in-progress projects
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý bệnh viện tích hợp IoT'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.008'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý bệnh viện tích hợp IoT'), NULL, GV_CNTT_001_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình deep learning cho dự báo thời tiết'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.001'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình deep learning cho dự báo thời tiết'), NULL, GV_CNTT_004_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý tài chính cá nhân'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.009'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý tài chính cá nhân'), NULL, GV_CNTT_002_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống thi đấu lập trình trực tuyến'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.010'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống thi đấu lập trình trực tuyến'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE');

  -- 15. Create final reports for completed projects
  INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
  VALUES
    (gen_random_uuid(), 'library_management_final_report.pdf', 'Báo cáo cuối kỳ - Hệ thống quản lý thư viện.pdf', '/uploads/report/library_system.pdf', 'PDF', 'application/pdf', 9200, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NOW()),
    (gen_random_uuid(), 'license_plate_recognition_report.pdf', 'Báo cáo - Nhận diện biển số xe.pdf', '/uploads/report/license_plate.pdf', 'PDF', 'application/pdf', 8800, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), NOW()),
    (gen_random_uuid(), 'schedule_optimization_report.pdf', 'Nghiên cứu tối ưu hóa lịch học.pdf', '/uploads/report/schedule_opt.pdf', 'PDF', 'application/pdf', 7500, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.009'), NOW()),
    (gen_random_uuid(), 'ecommerce_microservices_report.pdf', 'Hệ thống thương mại điện tử microservices.pdf', '/uploads/report/ecommerce.pdf', 'PDF', 'application/pdf', 10200, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.007'), NOW()),
    (gen_random_uuid(), 'sentiment_analysis_report.pdf', 'Phân tích cảm xúc từ văn bản.pdf', '/uploads/report/sentiment.pdf', 'PDF', 'application/pdf', 6800, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.010'), NOW());

  -- Add final report records
  INSERT INTO "project_final_report" ("id", "project_id", "main_report_file_id", "student_id", "submitted_at", "updated_at")
  VALUES
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), (SELECT id FROM "file" WHERE "file_name" = 'library_management_final_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NOW() - INTERVAL '1 week', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), (SELECT id FROM "file" WHERE "file_name" = 'license_plate_recognition_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), NOW() - INTERVAL '5 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán tối ưu hóa lịch học'), (SELECT id FROM "file" WHERE "file_name" = 'schedule_optimization_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.009'), NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống e-commerce với microservices'), (SELECT id FROM "file" WHERE "file_name" = 'ecommerce_microservices_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.007'), NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng phân tích cảm xúc từ văn bản'), (SELECT id FROM "file" WHERE "file_name" = 'sentiment_analysis_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.010'), NOW(), NOW());

  -- 16. Add more project comments for various projects
  INSERT INTO "project_comment" ("id", "content", "project_id", "commenter_faculty_member_id", "commenter_student_id", "created_at", "updated_at")
  VALUES
    -- Comments for completed projects
    (gen_random_uuid(), 'Dự án đã hoàn thành tốt, báo cáo chi tiết và đầy đủ. Sẵn sàng để bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), HEAD_WEBAPP_ID, NULL, NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), 'Thuật toán nhận diện hoạt động chính xác, demo thuyết phục. Cần tạo hội đồng bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), HEAD_AI_ID, NULL, NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), 'Nghiên cứu có tính khoa học cao, kết quả thử nghiệm tốt. Đề nghị xem xét tạo hội đồng.', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán tối ưu hóa lịch học'), HEAD_AI_ID, NULL, NOW(), NOW()),
    
    -- Student responses
    (gen_random_uuid(), 'Em cảm ơn thầy, em đã chuẩn bị đầy đủ tài liệu để bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), NULL, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), 'Em đã hoàn thiện phần demo và slide thuyết trình.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), NULL, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), NOW(), NOW()),
    
    -- Comments for in-progress projects
    (gen_random_uuid(), 'Tiến độ dự án tốt, cần tập trung hoàn thiện phần giao diện người dùng.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý bệnh viện tích hợp IoT'), GV_CNTT_001_ID, NULL, NOW() - INTERVAL '1 week', NOW()),
    (gen_random_uuid(), 'Mô hình AI đã cho kết quả khả quan, cần thu thập thêm dữ liệu để training.', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình deep learning cho dự báo thời tiết'), GV_CNTT_004_ID, NULL, NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), 'Ứng dụng mobile đã hoạt động cơ bản, cần bổ sung tính năng báo cáo thống kê.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý tài chính cá nhân'), GV_CNTT_002_ID, NULL, NOW() - INTERVAL '5 days', NOW());

  -- 17. Add more notifications for various activities
  INSERT INTO "notification" ("id", "recipient_student_id", "recipient_faculty_id", "sender_faculty_id", "type", "title", "message", "related_entity_type", "related_entity_id", "is_read", "created_at", "faculty_id")
  VALUES
    -- Notifications about completed projects needing defense committees
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NULL, HEAD_WEBAPP_ID, 'TASK_ASSIGNED', 'Dự án hoàn thành - Chuẩn bị bảo vệ', 'Dự án "Hệ thống quản lý thư viện số thông minh" đã được duyệt hoàn thành. Vui lòng chuẩn bị cho buổi bảo vệ.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý thư viện số thông minh'), FALSE, NOW() - INTERVAL '2 days', FACULTY_CNTT_ID),
    
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.006'), NULL, HEAD_AI_ID, 'TASK_ASSIGNED', 'Dự án sẵn sàng bảo vệ', 'Dự án "Ứng dụng nhận diện biển số xe thông minh" đã hoàn thành. Hội đồng bảo vệ sẽ được thông báo sớm.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng nhận diện biển số xe thông minh'), FALSE, NOW() - INTERVAL '1 day', FACULTY_CNTT_ID),
    
    -- Notifications to faculty about creating defense committees
    (gen_random_uuid(), NULL, DEAN_CNTT_ID, HEAD_WEBAPP_ID, 'TASK_ASSIGNED', 'Yêu cầu tạo hội đồng bảo vệ', 'Dự án "Hệ thống e-commerce với microservices" cần được tạo hội đồng bảo vệ. Sinh viên đã nộp báo cáo hoàn chỉnh.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Hệ thống e-commerce với microservices'), FALSE, NOW(), FACULTY_CNTT_ID),
    
    (gen_random_uuid(), NULL, DEAN_CNTT_ID, HEAD_AI_ID, 'TASK_ASSIGNED', 'Yêu cầu tạo hội đồng bảo vệ', 'Dự án nghiên cứu "Nghiên cứu thuật toán tối ưu hóa lịch học" đã hoàn thành và cần hội đồng đánh giá.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán tối ưu hóa lịch học'), FALSE, NOW(), FACULTY_CNTT_ID),
    
    -- Deadline notifications
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.008'), NULL, GV_CNTT_001_ID, 'DEADLINE', 'Nhắc nhở tiến độ dự án', 'Dự án "Hệ thống quản lý bệnh viện tích hợp IoT" cần hoàn thành báo cáo tiến độ trong tuần này.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý bệnh viện tích hợp IoT'), FALSE, NOW() - INTERVAL '2 days', FACULTY_CNTT_ID),
    
    -- Selection approval notifications
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.010'), NULL, HEAD_WEBAPP_ID, 'PROPOSAL_STATUS_CHANGE', 'Nguyện vọng được duyệt', 'Nguyện vọng "Nghiên cứu phương pháp xác thực đa yếu tố" đã được phê duyệt. Vui lòng liên hệ giảng viên hướng dẫn.', 'STUDENT_SELECTION', NULL, TRUE, NOW() - INTERVAL '3 days', FACULTY_CNTT_ID),
    
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NULL, GV_CNTT_002_ID, 'PROPOSAL_STATUS_CHANGE', 'Nguyện vọng được duyệt', 'Nguyện vọng "Ứng dụng Blockchain trong hệ thống cấp bằng số" đã được chấp nhận.', 'STUDENT_SELECTION', NULL, FALSE, NOW() - INTERVAL '1 day', FACULTY_CNTT_ID);

  -- 18. Add more projects with WAITING_FOR_EVALUATION status (ready for defense committees)
  INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
  VALUES 
    -- Projects with WAITING_FOR_EVALUATION status that need defense committees
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống quản lý nhân sự thông minh', 'Xây dựng hệ thống quản lý nhân sự với AI để tự động phân tích hiệu suất làm việc', 'Phát triển Web/App', 'WAITING_FOR_EVALUATION', HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng chatbot hỗ trợ khách hàng', 'Phát triển chatbot sử dụng NLP để hỗ trợ tự động trả lời khách hàng', 'Trí tuệ Nhân tạo', 'WAITING_FOR_EVALUATION', GV_CNTT_003_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), 'RESEARCH', 'Nghiên cứu thuật toán phát hiện deepfake', 'Phát triển thuật toán deep learning để phát hiện video deepfake', 'Trí tuệ Nhân tạo', 'WAITING_FOR_EVALUATION', HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '2 months', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống quản lý chuỗi cung ứng', 'Xây dựng hệ thống theo dõi và quản lý chuỗi cung ứng với blockchain', 'Phát triển Web/App', 'WAITING_FOR_EVALUATION', GV_CNTT_001_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '1 week'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng học tập thích ứng với AI', 'Phát triển ứng dụng e-learning sử dụng AI để cá nhân hóa nội dung học tập', 'Trí tuệ Nhân tạo', 'WAITING_FOR_EVALUATION', GV_CNTT_004_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '1 month', NOW()),
    (gen_random_uuid(), 'COMPETITION', 'Hệ thống thi đấu game online', 'Xây dựng nền tảng thi đấu game với ranking và tournament system', 'Phát triển Web/App', 'WAITING_FOR_EVALUATION', GV_CNTT_002_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '5 weeks', NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), 'RESEARCH', 'Nghiên cứu mô hình dự đoán giá cổ phiếu', 'Sử dụng machine learning và sentiment analysis để dự đoán giá cổ phiếu', 'Trí tuệ Nhân tạo', 'WAITING_FOR_EVALUATION', GV_CNTT_006_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '2 months', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng quản lý sức khỏe cá nhân', 'Phát triển ứng dụng mobile theo dõi sức khỏe với IoT devices', 'Phát triển Web/App', 'WAITING_FOR_EVALUATION', GV_CNTT_005_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), 'GRADUATED', 'Hệ thống phân tích dữ liệu bán hàng', 'Xây dựng dashboard phân tích dữ liệu bán hàng với machine learning', 'Trí tuệ Nhân tạo', 'WAITING_FOR_EVALUATION', HEAD_AI_ID, FIELDPOOL_HK1_2425_ID, DIV_AI_ID, NOW() - INTERVAL '4 weeks', NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), 'GRADUATED', 'Ứng dụng quản lý dự án Agile', 'Phát triển công cụ quản lý dự án theo phương pháp Agile/Scrum', 'Phát triển Web/App', 'WAITING_FOR_EVALUATION', HEAD_WEBAPP_ID, FIELDPOOL_HK1_2425_ID, DIV_WEBAPP_ID, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 day');

  -- Add members to the WAITING_FOR_EVALUATION projects
  INSERT INTO "project_member" ("id", "project_id", "student_id", "faculty_member_id", "role", "status")
  VALUES
    -- Members for projects waiting for evaluation
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.002'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), NULL, GV_CNTT_003_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.003'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), NULL, HEAD_AI_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý chuỗi cung ứng'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý chuỗi cung ứng'), NULL, GV_CNTT_001_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng học tập thích ứng với AI'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.004'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng học tập thích ứng với AI'), NULL, GV_CNTT_004_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống thi đấu game online'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.001'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống thi đấu game online'), NULL, GV_CNTT_002_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình dự đoán giá cổ phiếu'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.005'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình dự đoán giá cổ phiếu'), NULL, GV_CNTT_006_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý sức khỏe cá nhân'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.002'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý sức khỏe cá nhân'), NULL, GV_CNTT_005_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống phân tích dữ liệu bán hàng'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.001'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống phân tích dữ liệu bán hàng'), NULL, HEAD_AI_ID, 'ADVISOR', 'ACTIVE'),
    
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý dự án Agile'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.003'), NULL, 'STUDENT', 'ACTIVE'),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý dự án Agile'), NULL, HEAD_WEBAPP_ID, 'ADVISOR', 'ACTIVE');

  -- 19. Create final reports for the WAITING_FOR_EVALUATION projects
  INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
  VALUES
    (gen_random_uuid(), 'hr_management_system_report.pdf', 'Báo cáo - Hệ thống quản lý nhân sự.pdf', '/uploads/report/hr_system.pdf', 'PDF', 'application/pdf', 8900, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), NOW()),
    (gen_random_uuid(), 'chatbot_customer_support_report.pdf', 'Báo cáo - Chatbot hỗ trợ khách hàng.pdf', '/uploads/report/chatbot.pdf', 'PDF', 'application/pdf', 7600, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.002'), NOW()),
    (gen_random_uuid(), 'deepfake_detection_research.pdf', 'Nghiên cứu phát hiện deepfake.pdf', '/uploads/report/deepfake.pdf', 'PDF', 'application/pdf', 9800, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.003'), NOW()),
    (gen_random_uuid(), 'supply_chain_management_report.pdf', 'Hệ thống quản lý chuỗi cung ứng.pdf', '/uploads/report/supply_chain.pdf', 'PDF', 'application/pdf', 8200, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NOW()),
    (gen_random_uuid(), 'adaptive_learning_ai_report.pdf', 'Ứng dụng học tập thích ứng AI.pdf', '/uploads/report/adaptive_learning.pdf', 'PDF', 'application/pdf', 7800, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.004'), NOW()),
    (gen_random_uuid(), 'online_gaming_tournament_report.pdf', 'Hệ thống thi đấu game online.pdf', '/uploads/report/gaming.pdf', 'PDF', 'application/pdf', 6900, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.001'), NOW()),
    (gen_random_uuid(), 'stock_price_prediction_research.pdf', 'Nghiên cứu dự đoán giá cổ phiếu.pdf', '/uploads/report/stock_prediction.pdf', 'PDF', 'application/pdf', 9200, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.005'), NOW()),
    (gen_random_uuid(), 'health_management_app_report.pdf', 'Ứng dụng quản lý sức khỏe.pdf', '/uploads/report/health_app.pdf', 'PDF', 'application/pdf', 7400, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.002'), NOW()),
    (gen_random_uuid(), 'sales_data_analysis_report.pdf', 'Phân tích dữ liệu bán hàng.pdf', '/uploads/report/sales_analysis.pdf', 'PDF', 'application/pdf', 8600, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.001'), NOW()),
    (gen_random_uuid(), 'agile_project_management_report.pdf', 'Quản lý dự án Agile.pdf', '/uploads/report/agile_pm.pdf', 'PDF', 'application/pdf', 7200, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.003'), NOW());

  -- Add final report records for WAITING_FOR_EVALUATION projects
  INSERT INTO "project_final_report" ("id", "project_id", "main_report_file_id", "student_id", "submitted_at", "updated_at")
  VALUES
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), (SELECT id FROM "file" WHERE "file_name" = 'hr_management_system_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), (SELECT id FROM "file" WHERE "file_name" = 'chatbot_customer_support_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.002'), NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), (SELECT id FROM "file" WHERE "file_name" = 'deepfake_detection_research.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.003'), NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý chuỗi cung ứng'), (SELECT id FROM "file" WHERE "file_name" = 'supply_chain_management_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.005'), NOW() - INTERVAL '1 week', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng học tập thích ứng với AI'), (SELECT id FROM "file" WHERE "file_name" = 'adaptive_learning_ai_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.004'), NOW(), NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống thi đấu game online'), (SELECT id FROM "file" WHERE "file_name" = 'online_gaming_tournament_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.001'), NOW() - INTERVAL '4 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu mô hình dự đoán giá cổ phiếu'), (SELECT id FROM "file" WHERE "file_name" = 'stock_price_prediction_research.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.005'), NOW() - INTERVAL '5 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý sức khỏe cá nhân'), (SELECT id FROM "file" WHERE "file_name" = 'health_management_app_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.002'), NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Hệ thống phân tích dữ liệu bán hàng'), (SELECT id FROM "file" WHERE "file_name" = 'sales_data_analysis_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.001'), NOW() - INTERVAL '6 days', NOW()),
    (gen_random_uuid(), (SELECT id FROM "project" WHERE "title" = 'Ứng dụng quản lý dự án Agile'), (SELECT id FROM "file" WHERE "file_name" = 'agile_project_management_report.pdf'), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.003'), NOW() - INTERVAL '1 day', NOW());

  -- 20. Add comments for WAITING_FOR_EVALUATION projects
  INSERT INTO "project_comment" ("id", "content", "project_id", "commenter_faculty_member_id", "commenter_student_id", "created_at", "updated_at")
  VALUES
    -- Faculty comments indicating projects are ready for evaluation
    (gen_random_uuid(), 'Dự án đã hoàn thành đầy đủ, báo cáo chất lượng cao. Sẵn sàng cho việc đánh giá và bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), HEAD_WEBAPP_ID, NULL, NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), 'Chatbot hoạt động tốt, có khả năng xử lý ngôn ngữ tự nhiên ấn tượng. Đề nghị tạo hội đồng đánh giá.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), GV_CNTT_003_ID, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Nghiên cứu có tính khoa học cao, thuật toán cho kết quả chính xác. Cần hội đồng chuyên môn đánh giá.', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), HEAD_AI_ID, NULL, NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), 'Hệ thống blockchain được triển khai tốt, demo thuyết phục. Sẵn sàng bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý chuỗi cung ứng'), GV_CNTT_001_ID, NULL, NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), 'Ứng dụng AI cá nhân hóa học tập rất ấn tượng. Đề nghị xem xét tạo hội đồng đánh giá.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng học tập thích ứng với AI'), GV_CNTT_004_ID, NULL, NOW() - INTERVAL '1 day', NOW()),
    
    -- Student responses
    (gen_random_uuid(), 'Em cảm ơn thầy, em đã chuẩn bị đầy đủ tài liệu và demo cho buổi bảo vệ.', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), NULL, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), NOW(), NOW()),
    (gen_random_uuid(), 'Em đã hoàn thiện phần training model và chuẩn bị slide thuyết trình.', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), NULL, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.002'), NOW(), NOW()),
    (gen_random_uuid(), 'Em đã test kỹ thuật toán với nhiều dataset khác nhau và có kết quả tốt.', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), NULL, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.003'), NOW() - INTERVAL '1 day', NOW());

  -- 21. Add more notifications for WAITING_FOR_EVALUATION projects
  INSERT INTO "notification" ("id", "recipient_student_id", "recipient_faculty_id", "sender_faculty_id", "type", "title", "message", "related_entity_type", "related_entity_id", "is_read", "created_at", "faculty_id")
  VALUES
    -- Notifications to students about project evaluation readiness
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.004'), NULL, HEAD_WEBAPP_ID, 'TASK_ASSIGNED', 'Dự án sẵn sàng đánh giá', 'Dự án "Hệ thống quản lý nhân sự thông minh" đã được duyệt hoàn thành và sẵn sàng cho việc đánh giá. Hội đồng bảo vệ sẽ được thông báo sớm.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý nhân sự thông minh'), FALSE, NOW() - INTERVAL '1 day', FACULTY_CNTT_ID),
    
    (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.AI.002'), NULL, GV_CNTT_003_ID, 'TASK_ASSIGNED', 'Dự án chờ tạo hội đồng', 'Dự án "Ứng dụng chatbot hỗ trợ khách hàng" đã hoàn thành. Đang chờ tạo hội đồng bảo vệ.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng chatbot hỗ trợ khách hàng'), FALSE, NOW(), FACULTY_CNTT_ID),
    
    -- Notifications to dean about creating defense committees
    (gen_random_uuid(), NULL, DEAN_CNTT_ID, HEAD_AI_ID, 'TASK_ASSIGNED', 'Yêu cầu tạo hội đồng đánh giá', 'Dự án nghiên cứu "Nghiên cứu thuật toán phát hiện deepfake" cần được tạo hội đồng đánh giá chuyên môn.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Nghiên cứu thuật toán phát hiện deepfake'), FALSE, NOW() - INTERVAL '1 day', FACULTY_CNTT_ID),
    
    (gen_random_uuid(), NULL, DEAN_CNTT_ID, GV_CNTT_001_ID, 'TASK_ASSIGNED', 'Yêu cầu tạo hội đồng bảo vệ', 'Dự án "Hệ thống quản lý chuỗi cung ứng" đã hoàn thành và cần hội đồng bảo vệ.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Hệ thống quản lý chuỗi cung ứng'), FALSE, NOW() - INTERVAL '2 days', FACULTY_CNTT_ID),
    
    (gen_random_uuid(), NULL, DEAN_CNTT_ID, GV_CNTT_004_ID, 'TASK_ASSIGNED', 'Dự án AI sẵn sàng đánh giá', 'Dự án "Ứng dụng học tập thích ứng với AI" đã hoàn thành và sẵn sàng cho việc tạo hội đồng đánh giá.', 'PROJECT', (SELECT id FROM "project" WHERE "title" = 'Ứng dụng học tập thích ứng với AI'), FALSE, NOW(), FACULTY_CNTT_ID);

  -- 22. Thêm dự án mới cho test - Giáo viên Lan Anh chưa chấm điểm
  DECLARE
    TEST_PROJECT_ID UUID := gen_random_uuid();
    TEST_EVALUATION_ID UUID := gen_random_uuid();
    TEST_DEFENSE_COMMITTEE_ID UUID := gen_random_uuid();
    TEST_FINAL_REPORT_ID UUID := gen_random_uuid();
    TEST_FINAL_REPORT_RECORD_ID UUID := gen_random_uuid();
  BEGIN
    -- Tạo dự án test với status WAITING_FOR_EVALUATION
    INSERT INTO "project" ("id", "type", "title", "description", "field", "status", "approved_by_id", "field_pool_id", "division_id", "created_at", "updated_at")
    VALUES (
      TEST_PROJECT_ID,
      'GRADUATED',
      'Hệ thống quản lý bán hàng online với AI',
      'Xây dựng hệ thống thương mại điện tử tích hợp AI để gợi ý sản phẩm và phân tích hành vi khách hàng',
      'Phát triển Web/App',
      'WAITING_FOR_EVALUATION',
      GV_CNTT_001_ID,
      FIELDPOOL_HK1_2425_ID,
      DIV_WEBAPP_ID,
      NOW() - INTERVAL '2 weeks',
      NOW() - INTERVAL '3 days'
    );
    
    -- Thêm thành viên dự án (sinh viên và giáo viên hướng dẫn Lan Anh)
    INSERT INTO "project_member" ("id", "project_id", "student_id", "faculty_member_id", "role", "status")
    VALUES
      (gen_random_uuid(), TEST_PROJECT_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NULL, 'STUDENT', 'ACTIVE'),
      (gen_random_uuid(), TEST_PROJECT_ID, NULL, GV_CNTT_001_ID, 'ADVISOR', 'ACTIVE');
    
    -- Tạo file báo cáo cuối kỳ
    INSERT INTO "file" ("id", "file_name", "original_name", "file_path", "file_type", "mime_type", "file_size", "is_public", "uploaded_by_student_id", "created_at")
    VALUES (TEST_FINAL_REPORT_ID, 'ecommerce_ai_system_final_report.pdf', 'Báo cáo cuối kỳ - Hệ thống bán hàng AI.pdf', '/uploads/report/ecommerce_ai.pdf', 'PDF', 'application/pdf', 9500, FALSE, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NOW() - INTERVAL '3 days');
    
    -- Tạo bản ghi báo cáo cuối kỳ
    INSERT INTO "project_final_report" ("id", "project_id", "main_report_file_id", "student_id", "submitted_at", "updated_at")
    VALUES (TEST_FINAL_REPORT_RECORD_ID, TEST_PROJECT_ID, TEST_FINAL_REPORT_ID, (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NOW() - INTERVAL '3 days', NOW());
    
    -- Tạo hội đồng bảo vệ
    INSERT INTO "defense_committee" ("id", "name", "description", "project_id", "created_by_id", "status", "defense_date", "location", "created_at", "updated_at")
    VALUES (
      TEST_DEFENSE_COMMITTEE_ID,
      'Hội đồng đánh giá hệ thống bán hàng AI',
      'Hội đồng chấm đồ án hệ thống thương mại điện tử tích hợp AI',
      TEST_PROJECT_ID,
      DEAN_CNTT_ID,
      'SCHEDULED',
      (NOW() + INTERVAL '5 days'),
      'Phòng H103',
      NOW() - INTERVAL '2 days',
      NOW()
    );
    
    -- Thêm thành viên hội đồng
    INSERT INTO "defense_committee_member" ("id", "defense_committee_id", "faculty_member_id", "role")
    VALUES
      (gen_random_uuid(), TEST_DEFENSE_COMMITTEE_ID, HEAD_WEBAPP_ID, 'CHAIRMAN'),
      (gen_random_uuid(), TEST_DEFENSE_COMMITTEE_ID, GV_CNTT_002_ID, 'SECRETARY'),
      (gen_random_uuid(), TEST_DEFENSE_COMMITTEE_ID, GV_CNTT_005_ID, 'MEMBER'),
      (gen_random_uuid(), TEST_DEFENSE_COMMITTEE_ID, DEAN_CNTT_ID, 'MEMBER');
    
    -- Tạo evaluation record (chưa có điểm từ giáo viên hướng dẫn)
    INSERT INTO "project_evaluation" ("id", "project_id", "status", "advisor_weight", "committee_weight", "created_at", "updated_at")
    VALUES (TEST_EVALUATION_ID, TEST_PROJECT_ID, 'PENDING', 0.4, 0.6, NOW() - INTERVAL '1 day', NOW());
    
    -- Chỉ có điểm từ hội đồng, chưa có điểm từ giáo viên hướng dẫn Lan Anh
    INSERT INTO "project_evaluation_score" ("id", "evaluation_id", "evaluator_id", "role", "score", "comment", "created_at", "updated_at")
    VALUES 
      (gen_random_uuid(), TEST_EVALUATION_ID, HEAD_WEBAPP_ID, 'COMMITTEE', 8.5, 'Dự án có tính ứng dụng cao, giao diện đẹp và thân thiện với người dùng', NOW() - INTERVAL '1 day', NOW()),
      (gen_random_uuid(), TEST_EVALUATION_ID, GV_CNTT_002_ID, 'COMMITTEE', 8.0, 'Thuật toán AI hoạt động tốt, cần cải thiện hiệu năng xử lý', NOW() - INTERVAL '1 day', NOW()),
      (gen_random_uuid(), TEST_EVALUATION_ID, GV_CNTT_005_ID, 'COMMITTEE', 8.2, 'Báo cáo chi tiết, demo thuyết phục', NOW() - INTERVAL '1 day', NOW()),
      (gen_random_uuid(), TEST_EVALUATION_ID, DEAN_CNTT_ID, 'COMMITTEE', 8.8, 'Sinh viên thể hiện hiểu biết sâu về công nghệ, trả lời câu hỏi tốt', NOW() - INTERVAL '1 day', NOW());
    
    -- Thêm comment cho dự án
    INSERT INTO "project_comment" ("id", "content", "project_id", "commenter_faculty_member_id", "created_at", "updated_at")
    VALUES
      (gen_random_uuid(), 'Dự án đã hoàn thành tốt, đang chờ điểm đánh giá từ giáo viên hướng dẫn để hoàn tất quá trình.', TEST_PROJECT_ID, HEAD_WEBAPP_ID, NOW() - INTERVAL '1 day', NOW()),
      (gen_random_uuid(), 'Hội đồng đã chấm xong, cần có điểm từ GVHD để tính điểm cuối cùng.', TEST_PROJECT_ID, DEAN_CNTT_ID, NOW(), NOW());
    
    -- Thêm notification cho giáo viên Lan Anh
    INSERT INTO "notification" ("id", "recipient_student_id", "recipient_faculty_id", "sender_faculty_id", "type", "title", "message", "related_entity_type", "related_entity_id", "is_read", "created_at", "faculty_id")
    VALUES
      (gen_random_uuid(), NULL, GV_CNTT_001_ID, DEAN_CNTT_ID, 'TASK_ASSIGNED', 'Cần chấm điểm đồ án', 'Dự án "Hệ thống quản lý bán hàng online với AI" đã được hội đồng chấm xong. Vui lòng nhập điểm đánh giá của GVHD.', 'PROJECT', TEST_PROJECT_ID, FALSE, NOW(), FACULTY_CNTT_ID),
      (gen_random_uuid(), (SELECT id FROM "student" WHERE "student_code" = 'SV.CNTT.WA.006'), NULL, HEAD_WEBAPP_ID, 'INFO', 'Chờ điểm GVHD', 'Hội đồng đã hoàn thành việc chấm điểm. Đang chờ điểm đánh giá từ giáo viên hướng dẫn để có kết quả cuối cùng.', 'PROJECT', TEST_PROJECT_ID, FALSE, NOW(), FACULTY_CNTT_ID);
  END;

END $$;

