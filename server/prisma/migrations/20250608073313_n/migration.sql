/*
  Warnings:

  - A unique constraint covering the columns `[project_id,main_report_file_id]` on the table `project_final_report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "project_final_report_project_id_main_report_file_id_key" ON "project_final_report"("project_id", "main_report_file_id");
