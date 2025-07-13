import {
  DefenseCommitteeRoleT,
  DefenseCommitteeStatusT,
  DivisionRoleT,
  FacultyMemberRoleT,
  FacultyMemberStatusT,
  FacultyStatusT,
  FieldPoolStatusT,
  FileT,
  GenderT,
  LecturerSelection,
  Prisma,
  PrismaClient,
  File as PrismaFile,
  Project,
  ProjectEvaluationStatusT,
  ProjectStatusT,
  ProjectT,
  ProposalOutlineStatusT,
  ProposedProject,
  ProposedProjectStatusT,
  StudentSelection,
  StudentStatusT,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { uuidv7 } from 'uuidv7';

const prisma = new PrismaClient();

const uploadsBasePath = path.resolve(process.cwd(), 'uploads');
const DEFAULT_PASSWORD =
  '$2b$10$4BR920xd4IHuTSaWykT79u.PIziUOBYo4A06vvH37Oe6/6Ju2x9fm';

async function main() {
  await prisma.$transaction([
    prisma.notification.deleteMany({}),
    prisma.auditLog.deleteMany({}),
    prisma.defenseMember.deleteMany({}),
    prisma.defenseCommittee.deleteMany({}),
    prisma.projectReportComment.deleteMany({}),
    prisma.reportAttachment.deleteMany({}),
    prisma.projectFinalReport.deleteMany({}),
    prisma.projectComment.deleteMany({}),
    prisma.projectMember.deleteMany({}),
    prisma.projectDomain.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.proposedProjectComment.deleteMany({}),
    prisma.proposedProjectMember.deleteMany({}),
    prisma.proposedProject.deleteMany({}),
    prisma.proposalOutline.deleteMany({}),
    prisma.file.deleteMany({}),
    prisma.projectAllocation.deleteMany({}),
    prisma.studentSelection.deleteMany({}),
    prisma.lecturerSelection.deleteMany({}),
    prisma.fieldPoolDomain.deleteMany({}),
    prisma.fieldPoolFaculty.deleteMany({}),
    prisma.fieldPool.deleteMany({}),
    prisma.domain.deleteMany({}),
    prisma.facultyRole.deleteMany({}),
    prisma.facultyMembershipDivision.deleteMany({}),
    prisma.student.deleteMany({}),
    prisma.facultyMember.deleteMany({}),
    prisma.division.deleteMany({}),
    prisma.faculty.deleteMany({}),
  ]);

  console.log('🎉 Data initialization process completed successfully!');
}

main()
  .catch((e) => {
    console.error('🔴 Data initialization process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🚪 Prisma client disconnected.');
  });
