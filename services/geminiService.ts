
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { LessonPlanInput } from '../types';

export async function generateLessonPlanStream(
  input: LessonPlanInput,
  imageParts: { inlineData: { mimeType: string; data: string } }[],
  apiKey: string
): Promise<AsyncGenerator<GenerateContentResponse>> {
  
  const lessonTitleInstruction = input.lessonTitle
    ? `Tên bài dạy đã được người dùng cung cấp là: "${input.lessonTitle}". Hãy sử dụng tên này.`
    : `**Xác định Tên Bài Dạy:** Dựa vào nội dung hình ảnh, hãy xác định chính xác tên bài dạy.`;

  const subjectInstruction = input.subject
    ? `Môn học đã được người dùng cung cấp là: "${input.subject}".`
    : `**Xác định Môn Học:** Dựa vào nội dung hình ảnh, hãy xác định chính xác môn học (ví dụ: Toán, Tiếng Việt, Tự nhiên và Xã hội,...).`;

  const gradeInstruction = input.grade
    ? `Lớp đã được người dùng cung cấp là: "${input.grade}".`
    : `**Xác định Lớp:** Dựa vào nội dung hình ảnh, hãy xác định chính xác lớp (ví dụ: 1, 2, 3, 4, 5).`;

  const { level, periods } = input.duration;
  let levelText: string;
    switch (level) {
        case 'MamNon':
            levelText = 'Mầm non (25-30 phút/tiết)';
            break;
        case 'TieuHoc':
            levelText = 'Tiểu học (35 phút/tiết)';
            break;
        case 'THPT':
            levelText = 'THPT (45 phút/tiết)';
            break;
        case 'THCS':
        default:
            levelText = 'THCS (45 phút/tiết)';
            break;
    }
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
    - Nhiệm vụ của bạn là **PHÂN TÍCH SÂU** khối lượng kiến thức và bài tập trong hình ảnh SGK được cung cấp để **TỰ ĐỀ XUẤT** thời lượng hợp lý nhất (ví dụ: "1 tiết (35 phút)", "2 tiết (70 phút)", v.v.).
    - Thời lượng bạn đề xuất sẽ là kim chỉ nam cho độ dài và chi tiết của toàn bộ giáo án bạn sắp tạo. Hãy đảm bảo nội dung bạn tạo ra sau đó phải tương xứng TUYỆT ĐỐI với thời lượng này.
    `;
    
    const integratedEducationInstruction = `
      **YÊU CẦU MỚI TỪ NĂM HỌC 2024-2025: TÍCH HỢP NỘI DUNG GIÁO DỤC LIÊN MÔN**
      Bạn BẮT BUỘC phải xác định và tích hợp các nội dung giáo dục liên môn sau đây vào bài dạy một cách hợp lý và tường minh. Nội dung tích hợp phải được thể hiện trong đối tượng JSON \`giaoDucTichHop\`.
      - **kyNangSong**: Xác định các kỹ năng như giao tiếp, hợp tác, giải quyết vấn đề, quản lý cảm xúc có thể lồng ghép vào các hoạt động.
      - **quocPhongAnNinh**: Liên hệ đến lòng yêu nước, ý thức bảo vệ Tổ quốc, kỷ luật, các sự kiện lịch sử, anh hùng dân tộc (nếu phù hợp với bài học).
      - **baoVeMoiTruong**: Tích hợp các nội dung về tiết kiệm tài nguyên (nước, điện), bảo vệ không khí, trồng cây, phân loại rác...
      - **congDanSo**: Hướng dẫn về cách sử dụng công nghệ an toàn, hiệu quả, có trách nhiệm, văn minh trên mạng, đánh giá nguồn tin (nếu bài học có liên quan đến công nghệ, internet).
      Nếu một nội dung không thể tích hợp, hãy để trống chuỗi giá trị của nó trong JSON.`;

    let textPart;

    if (input.congVan === '2345') {
        textPart = { text: `
        Bạn là một chuyên gia giáo dục Tiểu học xuất sắc tại Việt Nam, am hiểu sâu sắc về Công văn 2345 của Bộ Giáo dục và Đào tạo.
        Nhiệm vụ của bạn là tạo một Kế hoạch bài dạy (Giáo án) CHI TIẾT và PHÙ HỢP cho học sinh Tiểu học dựa trên hình ảnh sách giáo khoa được cung cấp.

        **YÊU CẦU BẮT BUỘC VỀ CẤU TRÚC: Soạn giáo án theo đúng cấu trúc của Công văn 2345.**

        ${durationInstruction}
        
        ${integratedEducationInstruction}

        **Yêu cầu chi tiết về cấu trúc và nội dung:**
        1.  ${lessonTitleInstruction}
        2.  **Soạn thảo đầy đủ các mục:** I. YÊU CẦU CẦN ĐẠT, II. ĐỒ DÙNG DẠY HỌC, III. CÁC HOẠT ĐỘNG DẠY HỌC.
        3.  **Mục "I. YÊU CẦU CẦN ĐẠT" và "II. ĐỒ DÙNG DẠY HỌC"**: Phải diễn giải chi tiết, rõ ràng, sử dụng gạch đầu dòng (-) để liệt kê các ý.
        4.  **Mục "III. CÁC HOẠT ĐỘNG DẠY HỌC"**: Đây là phần trọng tâm, phải được trình bày dưới dạng một **bảng gồm 3 cột** với tiêu đề chính xác là: **"Hoạt động dạy học chủ yếu"**, **"Yêu cầu cần đạt"**, và **"Điều chỉnh"**.
            - **Cột "Hoạt động dạy học chủ yếu"**: Phải chia rõ các hoạt động lớn như **1. KHỞI ĐỘNG**, **2. HÌNH THÀNH KIẾN THỨC**, **3. LUYỆN TẬP, THỰC HÀNH**, **4. VẬN DỤNG**. Trong mỗi hoạt động lớn, có thể có các hoạt động nhỏ hơn (VD: Hoạt động 1: Luyện đọc). Phải mô tả chi tiết các bước tổ chức của giáo viên (GV) và các hoạt động tương ứng của học sinh (HS).
            - **Cột "Yêu cầu cần đạt"**: Nêu rõ mục tiêu cần đạt được của học sinh sau khi hoàn thành hoạt động tương ứng ở cột 1.
            - **Cột "Điều chỉnh"**: Ghi các lưu ý về việc điều chỉnh nội dung, phương pháp cho phù hợp với đối tượng học sinh (nếu có). Có thể để trống nếu không cần thiết.
        5.  **Ngôn ngữ và nội dung:** Phải phù hợp với lứa tuổi Tiểu học, vui tươi, sinh động, khuyến khích sự tham gia tích cực của học sinh.
        6.  **Định dạng:** Sử dụng Markdown cho văn bản.

        ---
        **QUAN TRỌNG: Định dạng đầu ra**
        Bạn PHẢI trả về TOÀN BỘ giáo án dưới dạng MỘT đối tượng JSON DUY NHẤT, hợp lệ. Cấu trúc JSON bắt buộc phải tuân theo mẫu sau:
        {
          "congVan": "2345",
          "lessonTitle": "Tên bài học do AI xác định",
          "subject": "Môn học do AI xác định",
          "grade": "Lớp do AI xác định",
          "duration": "Thời lượng do AI đề xuất hoặc được cung cấp",
          "yeuCauCanDat": "- Về năng lực: ...\\n- Về phẩm chất: ...",
          "giaoDucTichHop": {
            "kyNangSong": "Tích hợp rèn luyện kỹ năng làm việc nhóm qua hoạt động 2.",
            "quocPhongAnNinh": "",
            "baoVeMoiTruong": "Giáo dục ý thức giữ gìn vệ sinh lớp học.",
            "congDanSo": ""
          },
          "doDungDayHoc": "- Đối với GV: ...\\n- Đối với HS: ...",
          "hoatDongDayHoc": [
            {
              "hoatDong": "**1. KHỞI ĐỘNG**\\n- GV cho HS chơi trò chơi...\\n- HS tham gia...",
              "yeuCau": "- Tạo không khí vui vẻ...",
              "dieuChinh": ""
            },
            {
              "hoatDong": "**2. HÌNH THÀNH KIẾN THỨC**\\n**Hoạt động 1: Luyện đọc**\\n- GV đọc mẫu...\\n- HS luyện đọc theo cặp...",
              "yeuCau": "- Học sinh đọc đúng, rõ ràng...",
              "dieuChinh": "- Đối với HS đọc chậm, GV cần..."
            }
          ],
          "dieuChinhSauBaiDay": "Những lưu ý hoặc điều chỉnh sau khi thực hiện bài dạy..."
        }
        Hãy bắt đầu tạo chuỗi JSON ngay lập tức.
        `}
    } else { // Default to 5512
      textPart = {
      text: `
      Bạn là một chuyên gia giáo dục siêu việt tại Việt Nam, am hiểu sâu sắc về phương pháp luận và các công văn của Bộ Giáo dục và Đào tạo.
      Nhiệm vụ của bạn là tạo một Kế hoạch bài dạy (Giáo án) CHI TIẾT, SÂU SẮC và ĐẦY ĐỦ dựa trên các hình ảnh từ sách giáo khoa được cung cấp.

      **YÊU CẦU TỐI THƯỢỢNG VÀ QUAN TRỌNG NHẤT: ĐỘ DÀI VÀ CHI TIẾT CỦA NỘI DUNG**

      Đây là yêu cầu quan trọng nhất, quyết định sự thành công của giáo án. BẠN BẮT BUỘC PHẢI tuân thủ:

      ${durationInstruction}

      **CẤM TUYỆT ĐỐI TẠO GIÁO ÁN SƠ SÀI:** Một giáo án cho 2 hoặc 3 tiết không thể có độ dài tương đương 1 tiết. Đây là một lỗi không thể chấp nhận. Hãy đảm bảo mỗi hoạt động đều có chiều sâu và khối lượng công việc phù hợp với tổng thời gian.

      **HÃY TỰ KIỂM TRA:** Trước khi xuất ra nội dung cho một hoạt động, hãy tự hỏi: "Với nội dung này, học sinh có đủ việc để làm trong [tổng thời gian / số hoạt động] phút không?". Nếu câu trả lời là không, HÃY BỔ SUNG NGAY LẬP TỨC.

      ---
      
      ${integratedEducationInstruction}

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

      ${ input.duration.level === 'MamNon' ? `
      **Yêu cầu chi tiết về cấu trúc và nội dung cho cấp MẦM NON:**
      1.  ${lessonTitleInstruction}
      2.  **Soạn thảo đầy đủ các mục:** I. MỤC TIÊU (Gồm: Kiến thức, Kỹ năng, Thái độ), II. CHUẨN BỊ, III. TỔ CHỨC HOẠT ĐỘNG.
      3.  **Mục III. TỔ CHỨC HOẠT ĐỘNG phải có 3 HOẠT ĐỘNG cốt lõi sau:**
          - **Hoạt động 1: Ổn định tổ chức, gây hứng thú:** Bắt đầu bằng bài hát, câu đố, trò chuyện, trò chơi vận động nhẹ nhàng để thu hút sự chú ý và dẫn dắt trẻ vào chủ đề.
          - **Hoạt động 2: Hoạt động trọng tâm (Nội dung chính):** Đây là phần chính, tập trung vào việc cung cấp kiến thức và rèn luyện kỹ năng cho trẻ thông qua các hoạt động trải nghiệm, khám phá. (Ví dụ: Cô cho trẻ quan sát tranh và kể chuyện; Cô hướng dẫn trẻ nặn/vẽ/xé dán; Cô và trẻ cùng chơi trò chơi học tập...). Phần này cần mô tả chi tiết lời nói, hành động của cô và dự kiến hành động của trẻ.
          - **Hoạt động 3: Kết thúc:** Củng cố lại kiến thức đã học một cách nhẹ nhàng (ví dụ: nhận xét sản phẩm, cho trẻ hát/vận động lại theo bài hát của chủ đề), khen ngợi, động viên trẻ và chuyển sang hoạt động tiếp theo.
      4.  Trong mỗi hoạt động, đặc biệt là hoạt động 2, cần mô tả rõ các bước tổ chức của GV (lời nói, hành động) và các hoạt động tương ứng của trẻ.
      5.  Phần "d) Tổ chức thực hiện" trong JSON output phải trình bày dưới dạng bảng 2 cột: **"Hoạt động của GV và HS"** và **"Sản phẩm dự kiến"**.
          - Cột "Sản phẩm dự kiến": Có thể là tranh vẽ, sản phẩm nặn của trẻ, khả năng trẻ kể lại một đoạn truyện ngắn, hát đúng và vận động theo nhạc...
      6.  **JSON output:** Vẫn giữ nguyên cấu trúc JSON của CV5512, nhưng hãy ánh xạ 3 hoạt động trên vào "hoatDong1", "hoatDong2", "hoatDong3" và có thể bỏ qua "hoatDong4" hoặc điền nội dung củng cố, dặn dò. Các mục "kienThuc", "nangLuc", "phamChat" trong JSON có thể được ánh xạ từ Mục tiêu (Kiến thức, Kỹ năng, Thái độ). Mục "thietBi" trong JSON sẽ là mục "CHUẨN BỊ".
      ` : `
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
      `}
      ---
      **YÊU CẦU CUỐI CÙNG & KIỂM TRA LẠI:**
      Trước khi kết thúc, hãy tự rà soát lại một lần cuối.
      1.  **ĐÃ HOÀN THÀNH TẤT CẢ CÁC HOẠT ĐỘNG CHƯA?**
      2.  **NỘI DUNG CÓ ĐỦ SÂU VÀ CHI TIẾT** cho thời lượng đã đề xuất không?
      3.  **CÁC CỘT "SẢN PHẨM DỰ KIẾN"** đã được điền đầy đủ và cụ thể chưa?
      
      Giáo án bạn tạo ra phải là một sản phẩm hoàn chỉnh, sẵn sàng để giáo viên sử dụng ngay. **KHÔNG ĐƯỢC PHÉP DỪNG LẠI GIỮA CHỪNG.**
      ---

      **QUAN TRỌNG: Định dạng đầu ra**
      Bạn PHẢI trả về TOÀN BỘ giáo án dưới dạng MỘT đối tượng JSON DUY NHẤT, hợp lệ. KHÔNG được thêm bất kỳ văn bản nào khác trước hoặc sau đối tượng JSON này.
      Toàn bộ output của bạn phải là một chuỗi JSON có thể parse được.

      **LƯU Ý CỰC KỲ QUAN TRỌC VỀ KÝ TỰ:** Bên trong các giá trị chuỗi (string values) của JSON, nếu bạn cần sử dụng dấu ngoặc kép ("), bạn BẮT BUỘC phải escape nó bằng dấu gạch chéo ngược (\\"). Ví dụ: \`{"key": "GV nói: \\"Chào các em.\\""}\`. Việc này là BẮT BUỘC để đảm bảo JSON hợp lệ.

      Cấu trúc JSON bắt buộc phải tuân theo mẫu sau:
      {
        "congVan": "5512",
        "lessonTitle": "Tên bài học do AI xác định",
        "subject": "Môn học do AI xác định",
        "grade": "Lớp do AI xác định",
        "duration": "Thời lượng do AI đề xuất hoặc được cung cấp (ví dụ: '2 tiết')",
        "mucTieu": {
          "kienThuc": "Nội dung kiến thức...",
          "nangLuc": "Nội dung năng lực...",
          "phamChat": "Nội dung phẩm chất..."
        },
        "giaoDucTichHop": {
            "kyNangSong": "Tích hợp rèn luyện kỹ năng thuyết trình qua hoạt động 4.",
            "quocPhongAnNinh": "Liên hệ đến tinh thần yêu nước qua cuộc đời của anh hùng X.",
            "baoVeMoiTruong": "",
            "congDanSo": "Hướng dẫn học sinh tìm kiếm và đánh giá thông tin trên internet cho nhiệm vụ vận dụng."
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
    }
  
  const contents = { parts: [textPart, ...imageParts] };

  try {
    const ai = new GoogleGenAI({ apiKey });

    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        }
      });
    return responseStream;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error.toString().includes('API key not valid')) {
       throw new Error("API key not valid. Please check your key.");
    }
    throw new Error("Không thể tạo giáo án từ Gemini API. Đã có lỗi xảy ra, vui lòng thử lại.");
  }
}
