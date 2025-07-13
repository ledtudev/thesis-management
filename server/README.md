# 📌 Tài liệu UTC Research Hub

<p align="start">

🔗 Liên kết tài liệu

Mô hình Database: <a href="https://dbdiagram.io/d/utc-researchHub-67b8617c263d6cf9a0fd1194" target="blank">Xem tại đây</a>

Luồng nghiệp vụ: <a href="https://lucid.app/lucidchart/eab150fd-8c7c-44c7-9295-d1a0ffda0567/edit?invitationId=inv_dcb80342-eff4-4871-bff1-a216a98a1bcc&page=s3TRBo1xwdz4#" target="blank">Xem tại đây</a>

Tài liệu chi tiết: <a href="https://docs.google.com/document/d/1bQ0rWE2UWlkNvAOBxTDsI_eB6tWtGsMw1x09PDcz90M/edit?tab=t.0" target="blank">Google Docs</a>

</p>

## List of commit command
| No  | Preset      | Description                                                                                           | Example                                 |
| --- | ----------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `docs`      | Documentation only changes                                                                            | `docs: add button document`             |
| 2   | `feature`   | Add new feature                                                                                       | `feature: add button`                   |
| 3   | `fix`       | Fix bugs                                                                                              | `fix: fix button color`                 |
| 4   | `fixme`     | Mark a bug to fix                                                                                     | `fixme: update button color`            |
| 5   | `performance`| Improve performance of some code                                                                     | `performance: change search array method`|
| 6   | `revert`    | Reverts a previous commit                                                                             | `revert: revert commit 'abc'`           |
| 7   | `style`     | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | `style: change page layout`             |
| 8   | `test`      | Adding missing tests or correcting existing tests                                                     | `test: add test find all function`      |
| 9   | `todo`      | Mark todo work, add tags TODO                                                                         | `todo: add test find all function`      |
| 10  | `update`    | Small update                                                                                          | `update: add test find all function`    |

# Project Name

## Description
This project is an example setup for a development environment, with configurations for the database and JWT authentication.

## Environment Configuration

### Required Environment Variables

The following environment variables should be set for the application to function properly:

```bash
# Set the environment to development
NODE_ENV=development

# PostgreSQL Database configurations for development
DATABASE_URL="postgres://postgres:muckhotieu@localhost:5432/utc-researchhub?schema=public&connection_limit=10&pool_timeout=30000"

# Alternate PostgreSQL Database configuration (for NeonDB)
DATABASE_URL="postgresql://neondb_owner:npg_tmFi4NM5cPTp@ep-polished-pine-a5bbwdg1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Database connection settings
DB_NAME=postgres
DB_USERNAME=postgres
DB_PASSWORD=muckhotieu
DB_HOST=localhost
DB_PORT=5432

# JWT Secret Keys for authentication
JWT_SECRET_KEY=da46fc263ae021fbcad99eb6b3499a9c70cebc01fa5a2635947429ede1d5c5a0aa135c1af5c9279df0f2e16fe33e729651bba379db73c183fd696dc3e7c44a6f68ced0c3e43e2929da963cd7687e6fe4e87be463f11957401e2acf2dc9faad9435c35448f5f33e34acbac79692e35635756c3649d7738145de61f55758981c690343a8d30d66583445929cea7310ea3759e24833526631a90027edf025dce601aae9af1fec50b4825e5b2014d81c7c529cf257995fab812a1923400c6730961d66e2db07d4b95a7e11620df933d588176b6313b326db785f950a40cd9ef75efce675cd60f8fc6af96a1e33367a3d4c71688cba5cff93ce29fbb4f296d713fd3e

JWT_REFRESH_SECRET_KEY=17347e7eefa4fc9df880205ef66a1af46530d51c0718e1ca1829ca44c199350a5ef91bfb0eebc7b063f9c256912c5a52202e6840ca3e5f1a4c8f28bc4c779c13bf010e656ba8f89c4af0f8723c2fcf99f7f6e27cd4b23c8000a03a97b198b8452892c3aa96cfb62733d33f6939240ed1c424724ddab9ac71a444ef200ef8de37c1137b6fb0af615737fe5b104a6f6ad2b2770c8adae40085f099fb496f4f341f555ede1787c3b95ca025ba412e161fe20d640b6839ce94a9ca2f171ecf11810e28b74671d7407466a3ceb7af46c8c1fdd4cca2618dc0f669edc20f8e5469ef28e105c366c315521b65eb1ad3d27e775703ae970cee83383cfa2ae35ad3f349c7

# CDN URL for uploads
CDN_URL=http://localhost:3000/uploads

