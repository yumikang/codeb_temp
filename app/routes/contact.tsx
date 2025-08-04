import React, { useState } from "react";
import type { MetaFunction, LinksFunction } from "@remix-run/node";

// CSS imports - Remix 프로젝트에서 활성화 필요
// import styles from "~/styles/style.css";
// import bootstrap from "~/styles/vendor/bootstrap.min.css";
// import fontawesome from "~/styles/vendor/fontawesome.min.css";
// import koreanFont from "~/styles/korean-font.css";

export const links: LinksFunction = () => [
  // Remix 프로젝트에서 아래 주석을 해제하고 CSS 파일 경로 설정
  // { rel: "stylesheet", href: "/assets/vendor/bootstrap.min.css" },
  // { rel: "stylesheet", href: "/assets/vendor/fontawesome.min.css" },
  // { rel: "stylesheet", href: "/assets/css/style.css" },
  // { rel: "stylesheet", href: "/assets/css/korean-font.css" },
  // Google Fonts
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" },
];

export const meta: MetaFunction = () => {
  return [
    { title: "문의하기 - 디토 DITO" },
    { name: "description", content: "프로젝트 컨설팅 및 견적 요청" },
  ];
};

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    // 예산 값을 텍스트로 변환
    const budgetMap: { [key: string]: string } = {
      "1": "300만원 - 500만원",
      "2": "500만원 - 1,000만원",
      "3": "1,000만원 - 2,000만원",
      "4": "2,000만원 - 3,000만원",
      "5": "3,000만원 이상"
    };

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: (formData.get("company") as string) || "",
      budget: budgetMap[formData.get("Budget") as string] || "",
      message: formData.get("message") as string,
      privacy_required: formData.get("privacy_required") === "on",
      marketing_optional: formData.get("marketing_optional") === "on",
      timestamp: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbyRpxPQJgqGaQl2g3MVpZMbGFNDZxcQn6_qEEVM3IYo4CXLr0NZMEJy7W5ojXnnjPjCnw/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      setStatus("success");
      form.reset();
      
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
      
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      setErrorMessage("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      {/* contact area start  */}
      <section className="contact-area-contact-page">
        <div className="container large">
          <div className="contact-area-contact-page-inner section-spacing-top">
            <div className="section-header fade-anim">
              <div className="section-title-wrapper">
                <div className="subtitle-wrapper">
                  <span className="section-subtitle">문의하기</span>
                </div>
                <div className="title-wrapper">
                  <h2 className="section-title font-sequelsans-romanbody">프로젝트 컨설팅 및 견적 요청</h2>
                </div>
              </div>
            </div>
            <div className="section-content-wrapper fade-anim">
              <div className="section-content">
                <div className="contact-mail">
                  <p className="text">맞춤형 솔루션 견적 산출<br />
                    비즈니스 성장을 위한 첫걸음 <br />
                    <a href="mailto:sjlim0114@gmail.com">sjlim0114@gmail.com</a>
                  </p>
                </div>
              </div>
              <div className="contact-wrap">
                <form id="contact__form" method="POST" onSubmit={handleSubmit}>
                  <div className="contact-formwrap">
                    <div className="contact-formfield">
                      <input type="text" name="name" id="name" placeholder="이름*" required />
                    </div>
                    <div className="contact-formfield">
                      <input type="text" name="email" id="email" placeholder="이메일*" required />
                    </div>
                    <div className="contact-formfield">
                      <input type="text" name="phone" id="phone" placeholder="연락처*" required />
                    </div>
                    <div className="contact-formfield">
                      <input type="text" name="company" id="company" placeholder="회사명" />
                    </div>
                    <div className="contact-formfield">
                      <select name="Budget" id="Budget" required defaultValue="0">
                        <option value="0" disabled>예산*</option>
                        <option value="1">300만원 - 500만원</option>
                        <option value="2">500만원 - 1,000만원</option>
                        <option value="3">1,000만원 - 2,000만원</option>
                        <option value="4">2,000만원 - 3,000만원</option>
                        <option value="5">3,000만원 이상</option>
                      </select>
                    </div>
                    <div className="contact-formfield message">
                      <input type="text" name="message" id="message" placeholder="메시지*" required />
                    </div>
                  </div>
                  
                  {/* 개인정보 수집 동의 */}
                  <div className="privacy-agreement" style={{ margin: "30px 0", padding: "25px", background: "rgba(255,255,255,0.03)", borderRadius: "15px" }}>
                    <h4 style={{ fontSize: "18px", marginBottom: "20px", fontWeight: 600 }}>개인정보 수집 및 이용 동의</h4>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", fontSize: "15px", lineHeight: 1.6 }}>
                        <input type="checkbox" name="privacy_required" id="privacy_required" required style={{ marginRight: "10px", marginTop: "5px" }} />
                        <span>
                          <strong>(필수)</strong> 개인정보 수집·이용에 동의합니다<br />
                          <span style={{ color: "#999", fontSize: "14px", display: "block", marginTop: "5px" }}>
                            · 수집항목: 이름, 연락처, 이메일, 회사명<br />
                            · 이용목적: 견적 제공 및 프로젝트 상담<br />
                            · 보유기간: 문의일로부터 1년
                          </span>
                        </span>
                      </label>
                    </div>
                    
                    <div>
                      <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", fontSize: "15px", lineHeight: 1.6 }}>
                        <input type="checkbox" name="marketing_optional" id="marketing_optional" style={{ marginRight: "10px", marginTop: "5px" }} />
                        <span>
                          <strong>(선택)</strong> 마케팅 정보 수신에 동의합니다<br />
                          <span style={{ color: "#999", fontSize: "14px", display: "block", marginTop: "5px" }}>
                            · 디토의 새로운 서비스 및 이벤트 정보를 받아보실 수 있습니다
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="submit-btn">
                    <button type="submit" className="rr-btn" disabled={status === "loading"}>
                      <span className="btn-wrap">
                        <span className="text-one">{status === "loading" ? "전송 중..." : "메시지 보내기"}</span>
                        <span className="text-two">{status === "loading" ? "전송 중..." : "메시지 보내기"}</span>
                      </span>
                    </button>
                  </div>
                  
                  <div id="response-message">
                    {status === "success" && (
                      <div style={{ textAlign: "center", marginTop: "20px", color: "#4ade80", fontSize: "16px" }}>
                        ✅ 견적 요청이 성공적으로 전송되었습니다!<br />
                        빠른 시일 내에 연락드리겠습니다.
                      </div>
                    )}
                    {status === "error" && (
                      <div style={{ textAlign: "center", marginTop: "20px", color: "#f87171", fontSize: "16px" }}>
                        ❌ {errorMessage}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* contact area end  */}
      
      {/* Loading indicator */}
      {status === "loading" && (
        <div className="loading-form" style={{ display: "block" }}>로딩 중...</div>
      )}
    </>
  );
}