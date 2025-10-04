
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { LessonPlanInput } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateLessonPlanStream(
  input: LessonPlanInput,
  imageParts: { inlineData: { mimeType: string; data: string } }[]
): Promise<AsyncGenerator<GenerateContentResponse>> {
  
  const lessonTitleInstruction = input.lessonTitle
    ? `Tên bài dạy đã được người dùng cung cấp là: "${input.lessonTitle}". Hãy sử dụng tên này.`
    : `**Xác định Tên Bài Dạy:** Dựa vào nội dung hình ảnh, hãy xác định chính xác tên bài dạy.`;

  const subjectInstruction = input.subject
    ? `Môn học đã được người dùng cung cấp là: "${input.subject}".`
    : `**Xác định Môn Học:** Dựa vào nội dung hình ảnh, hãy xác định chính xác môn học (ví dụ: Toán, Ngữ văn, Lịch sử,...).`;

  const gradeInstruction = input.grade
    ? `Lớp đã được người dùng cung cấp là: "${input.grade}".`
    : `**Xác định Lớp:** Dựa vào nội dung hình ảnh, hãy xác định chính xác lớp (ví dụ: 6, 7, 10,...).`;

  const { level, periods } = input.duration;
  const levelText = level === 'TieuHoc' ? 'Tiểu học (35 phút/tiết)' : 'THCS (45 phút/tiết)';
  const finalDurationString = periods ? `${periods} tiết (Cấp ${levelText})` : '';

  const durationInstruction = finalDurationString
    ? `
    **PHÂN TÍCH KỸ LƯỠNG THỜI LƯỢNG ĐÃ CHO:**
    - "Thời gian thực hiện" được cung cấp là: **${finalDurationString}**. Đây là kim chỉ nam cho TOÀN BỘ nội dung bạn tạo ra.
    - Dựa vào thời lượng này, hãy tạo ra một giáo án có độ dài và chi tiết tương xứng TUYỆT ĐỐI. Một giáo án 2, 3 tiết phải chi tiết và dài hơn đáng kể so với 1 tiết.
    `
    : `
    **PHÂN TÍCH VÀ ĐỀ XUẤT THỜI LƯỢNG:**
    - "Thời gian thực hiện" KHÔNG được cung cấp.
    - Nhiệm vụ của bạn là **PHÂN TÍCH SÂU** khối lượng kiến thức và bài tập trong hình ảnh SGK được cung cấp để **TỰ ĐỀ XUẤT** thời lượng hợp lý nhất (ví dụ: "1 tiết (45 phút)", "2 tiết (90 phút)", "3 tiết (135 phút)", v.v.).
    - Thời lượng bạn đề xuất sẽ là kim chỉ nam cho độ dài và chi tiết của toàn bộ giáo án bạn sắp tạo. Hãy đảm bảo nội dung bạn tạo ra sau đó phải tương xứng TUYỆT ĐỐI với thời lượng này.
    `;

  const textPart = {
    text: `
    Bạn là một chuyên gia giáo dục siêu việt tại Việt Nam, am hiểu sâu sắc về phương pháp luận và các công văn của Bộ Giáo dục và Đào tạo.
    Nhiệm vụ của bạn là tạo một Kế hoạch bài dạy (Giáo án) CHI TIẾT, SÂU SẮC và ĐẦY ĐỦ dựa trên các hình ảnh từ sách giáo khoa được cung cấp.

    **YÊU CẦU TỐI THƯỢỢNG VÀ QUAN TRỌNG NHẤT: ĐỘ DÀI VÀ CHI TIẾT CỦA NỘI DUNG**

    Đây là yêu cầu quan trọng nhất, quyết định sự thành công của giáo án. BẠN BẮT BUỘC PHẢI tuân thủ:

    ${durationInstruction}

    **CẤM TUYỆT ĐỐI TẠO GIÁO ÁN SƠ SÀI:** Một giáo án cho 2 hoặc 3 tiết không thể có độ dài tương đương 1 tiết. Đây là một lỗi không thể chấp nhận. Hãy đảm bảo mỗi hoạt động đều có chiều sâu và khối lượng công việc phù hợp với tổng thời gian.

    **HÃY TỰ KIỂM TRA:** Trước khi xuất ra nội dung cho một hoạt động, hãy tự hỏi: "Với nội dung này, học sinh có đủ việc để làm trong [tổng thời gian / số hoạt động] phút không?". Nếu câu trả lời là không, HÃY BỔ SUNG NGAY LẬP TỨC.

    ---

    **YÊU CẦU BẮT BUỘC VỀ CẤU TRÚC: Soạn giáo án theo đúng cấu trúc của Công văn 5512.**

    **Thông tin cơ bản cần xác định (nếu người dùng không cung cấp):**
    - ${subjectInstruction}
    - ${gradeInstruction}
    - Thời gian thực hiện: ${finalDurationString || '(AI sẽ đề xuất)'}

    **YÊU CẦU ĐẶC BIỆT CHO MÔN TOÁN HÌNH HỌC:**
    Khi soạn nội dung liên quan đến hình học, bạn BẮT BUỘC phải mô tả các hình vẽ một cách **CỰC KỲ CHI TIẾT VÀ TƯỜNG MINH** bằng lời văn.
    - **Mô tả từng điểm, từng đoạn thẳng, từng góc.** Ví dụ: "Vẽ tam giác ABC vuông tại A. Trên cạnh BC, lấy điểm M sao cho BM = BA. Đường thẳng qua M vuông góc với BC cắt AC tại D."
    - **Nêu rõ các ký hiệu.** Ví dụ: "Ký hiệu góc vuông tại A, ký hiệu các đoạn thẳng bằng nhau."
    - **Mục tiêu:** Giáo viên đọc xong mô tả của bạn phải có thể vẽ lại hình một cách chính xác trên bảng mà không cần phải suy luận thêm. **ĐÂY LÀ YÊU CẦU BẮT BUỘC.**

    **Yêu cầu chi tiết về cấu trúc và nội dung:**
    1.  ${lessonTitleInstruction}
    2.  **Soạn thảo đầy đủ các mục:** I. MỤC TIÊU, II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU, III. TIẾN TRÌNH DẠY HỌC.
    3.  **Mục III. TIẾN TRÌNH DẠY HỌC phải có ĐÚNG 4 HOẠT ĐỘNG theo thứ tự sau:**
        - Hoạt động 1: Mở đầu (Xác định vấn đề/nhiệm vụ học tập)
        - Hoạt động 2: Hình thành kiến thức mới
        - Hoạt động 3: Luyện tập
        - Hoạt động 4: Vận dụng
    4.  Trong mỗi hoạt động trên, phải có đủ các mục: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện.
    5.  Phần "d) Tổ chức thực hiện" phải trình bày dưới dạng bảng 2 cột với tiêu đề chính xác là: **"Hoạt động của GV và HS"** và **"Sản phẩm dự kiến"**.
        - Cột "Hoạt động của GV và HS": Bắt đầu bằng tiêu đề in đậm **'Chuyển giao nhiệm vụ'**. Sau đó, sử dụng gạch đầu dòng (-) để liệt kê các bước tổ chức của GV và HS (VD: thực hiện nhiệm vụ, báo cáo - thảo luận, kết luận - nhận định). Phải mô tả rõ vai trò của GV (hướng dẫn, quan sát, gợi ý) và HS (thảo luận nhóm, làm bài tập cá nhân, trình bày).
        - Cột "Sản phẩm dự kiến": **ĐÂY LÀ YÊU CẦU BẮT BUỘC, KHÔNG ĐƯỢC BỎ TRỐNG.** Cột này phải mô tả RÕ RÀNG và CỤ THỂ sản phẩm học tập mà học sinh phải hoàn thành. Sản phẩm phải là thứ có thể quan sát, ghi nhận, hoặc chấm điểm được.
            - **Ví dụ tốt:** "- Đáp án chi tiết cho Bài tập 3 (SGK trang 25).\\n- Phiếu học tập số 1 đã điền đầy đủ thông tin.\\n- Sơ đồ tư duy tổng kết các tính chất của hình bình hành.\\n- Bài trình bày của nhóm 1 về kết quả thí nghiệm."
            - **Ví dụ xấu (KHÔNG DÙNG):** "- Học sinh hiểu bài.", "- Học sinh trả lời câu hỏi.", "- Sản phẩm của học sinh."
            - **QUAN TRỌNG:** Nội dung cột này phải tương ứng trực tiếp với các nhiệm vụ được giao ở cột "Hoạt động của GV và HS". Mỗi nhiệm vụ phải có một sản phẩm đầu ra tương ứng.
    6.  **Định dạng:** Sử dụng Markdown cho văn bản và cú pháp LaTeX cho công thức toán học (ví dụ: $\\frac{a}{b}$, $x^2$).

    ---
    **YÊU CẦU CUỐI CÙNG & KIỂM TRA LẠI:**
    Trước khi kết thúc, hãy tự rà soát lại một lần cuối.
    1.  **ĐÃ HOÀN THÀNH TẤT CẢ 4 HOẠT ĐỘNG CHƯA?** (Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng).
    2.  **NỘI DUNG CÓ ĐỦ SÂU VÀ CHI TIẾT** cho thời lượng đã đề xuất không?
    3.  **CÁC CỘT "SẢN PHẨM DỰ KIẾN"** đã được điền đầy đủ và cụ thể chưa?
    
    Giáo án bạn tạo ra phải là một sản phẩm hoàn chỉnh, sẵn sàng để giáo viên sử dụng ngay. **KHÔNG ĐƯỢC PHÉP DỪNG LẠI GIỮA CHỪNG.**
    ---

    **QUAN TRỌNG: Định dạng đầu ra**
    Bạn PHẢI trả về TOÀN BỘ giáo án dưới dạng MỘT đối tượng JSON DUY NHẤT, hợp lệ. KHÔNG được thêm bất kỳ văn bản nào khác trước hoặc sau đối tượng JSON này.
    Toàn bộ output của bạn phải là một chuỗi JSON có thể parse được, không có markdown fences như \`\`\`json.

    Cấu trúc JSON bắt buộc phải tuân theo mẫu sau:
    {
      "lessonTitle": "Tên bài học do AI xác định",
      "subject": "Môn học do AI xác định",
      "grade": "Lớp do AI xác định",
      "duration": "Thời lượng do AI đề xuất hoặc được cung cấp (ví dụ: '2 tiết')",
      "mucTieu": {
        "kienThuc": "Nội dung kiến thức...",
        "nangLuc": "Nội dung năng lực...",
        "phamChat": "Nội dung phẩm chất..."
      },
      "thietBi": "Nội dung thiết bị và học liệu...",
      "tienTrinh": {
        "hoatDong1": {
          "mucTieu": "...",
          "noiDung": "...",
          "sanPham": "...",
          "toChuc": {
            "noiDung": "**Chuyển giao nhiệm vụ**\\n- GV: ...\\n**Thực hiện nhiệm vụ**\\n- HS: ...",
            "sanPham": "- Câu trả lời của HS..."
          }
        },
        "hoatDong2": { "mucTieu": "...", "noiDung": "...", "sanPham": "...", "toChuc": {"noiDung": "...", "sanPham": "..."} },
        "hoatDong3": { "mucTieu": "...", "noiDung": "...", "sanPham": "...", "toChuc": {"noiDung": "...", "sanPham": "..."} },
        "hoatDong4": { "mucTieu": "...", "noiDung": "...", "sanPham": "...", "toChuc": {"noiDung": "...", "sanPham": "..."} }
      }
    }

    Hãy bắt đầu tạo chuỗi JSON ngay lập tức.
    `
  };
  
  const contents = { parts: [textPart, ...imageParts] };

  try {
    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          maxOutputTokens: 65536,
          thinkingConfig: { thinkingBudget: 4096 },
        }
      });
    return responseStream;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate lesson plan from Gemini API.");
  }
}
