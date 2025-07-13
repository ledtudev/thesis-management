import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trường Đại học Giao thông vận tải</title>
        <style>
            :root {
                --primary: #18181b;
                --secondary: #27272a;
                --accent: #8b5cf6;
                --text: #e4e4e7;
                --card-bg: rgba(39, 39, 42, 0.8);
                --border-color: rgba(255, 255, 255, 0.1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: var(--primary);
                color: var(--text);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }

            .container {
                max-width: 900px;
                background: var(--card-bg);
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
                text-align: center;
                border: 1px solid var(--border-color);
            }

            img {
                width: 100%;
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }

            h1 {
                font-size: 28px;
                margin: 15px 0;
                color: var(--accent);
            }

            p {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 15px;
            }

            .awards {
                text-align: left;
                background: var(--secondary);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }

            .awards h2 {
                font-size: 20px;
                margin-bottom: 10px;
                color: var(--accent);
            }

            .awards ul {
                list-style: none;
                padding: 0;
            }

            .awards li {
                font-size: 14px;
                padding: 6px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .awards li::before {
                content: "🏅";
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://utc.edu.vn/sites/default/files/12345678.jpg" alt="UTC University">
            <h1>Trường Đại học Giao thông vận tải</h1>
            <p><strong>Tiền thân</strong>: Trường Cao đẳng Công chính Việt Nam, khai giảng lại ngày 15/11/1945 theo Sắc lệnh của Chủ tịch Hồ Chí Minh.</p>
            <p>Trường có hai cơ sở tại Hà Nội và TP. Hồ Chí Minh, với sứ mệnh đào tạo, nghiên cứu khoa học và chuyển giao công nghệ chất lượng cao.</p>
            <div class="awards">
                <h2>Những phần thưởng cao quý</h2>
                <ul>
                    <li>Danh hiệu Anh hùng Lực lượng Vũ trang Nhân dân (2011)</li>
                    <li>Danh hiệu Anh hùng Lao động (2007)</li>
                    <li>Huân chương Hồ Chí Minh (2005)</li>
                    <li>02 Huân chương Độc lập Hạng Nhất (2000, 2015)</li>
                    <li>Huân chương Độc lập Hạng Nhì (1995)</li>
                    <li>Huân chương Độc lập Hạng Ba (1986)</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
