import { authorize } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get('sid');
    const { errorResponse } = await authorize(['admin', 'manager', 'staff'], sid);
    if (errorResponse) return errorResponse;
    
    try {
        const { productName, category, details } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ 
                message: 'Chưa cấu hình GEMINI_API_KEY trong file .env' 
            }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Bạn là một chuyên gia marketing cho shop Áo Dài cao cấp. 
        Hãy viết một đoạn mô tả sản phẩm hấp dẫn, hoa mỹ và chuẩn SEO cho sản phẩm sau:
        Tên sản phẩm: ${productName}
        Danh mục: ${category}
        Chi tiết thêm: ${details || 'Chất liệu lụa cao cấp, đường may tinh tế'}
        
        Yêu cầu:
        1. Viết bằng tiếng Việt, giọng văn sang trọng.
        2. Có các đoạn nhấn mạnh về vẻ đẹp truyền thống và hiện đại.
        3. Định dạng bằng Markdown (Sử dụng các thẻ tiêu đề, gạch đầu dòng).
        4. Tự động thêm danh sách các từ khóa SEO ở cuối.
        5. Độ dài khoảng 200-300 từ.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Gemini Error:', error);
        return NextResponse.json({ message: 'Lỗi khi gọi AI: ' + error.message }, { status: 500 });
    }
}
