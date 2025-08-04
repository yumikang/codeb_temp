import React from "react";
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "문의하기 - 디토DITTO" },
    { name: "description", content: "디토 - 문의하기" },
  ];
};

// 서버 사이드 액션 함수 - Google Sheets + Gmail
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
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
    timestamp: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    submissionId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  };

  // 기본 유효성 검사
  if (!data.name || !data.email || !data.phone || !data.message) {
    return json({ 
      success: false, 
      error: "필수 필드를 모두 입력해주세요." 
    }, { status: 400 });
  }

  if (!data.privacy_required) {
    return json({ 
      success: false, 
      error: "개인정보 수집 및 이용에 동의해주세요." 
    }, { status: 400 });
  }

  try {
    // Google Apps Script로 데이터 전송 (ymn9639@gmail.com 계정)
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

    console.log(`📝 폼 데이터 전송 완료: ${data.submissionId}`);
    console.log(`📊 Google Sheets 저장 + Gmail 발송 (ymn9639@gmail.com)`);
    
    // 성공 시 쿼리 파라미터와 함께 리다이렉트
    return redirect("/contact?success=true");
    
  } catch (error) {
    console.error("폼 처리 오류:", error);
    
    return json({ 
      success: false, 
      error: "전송 중 오류가 발생했습니다. 다시 시도해주세요." 
    }, { status: 500 });
  }
}

export default function Contact() {
  // Remix hooks - Progressive Enhancement
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // URL에서 성공 파라미터 확인
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccess(true);
      // URL 파라미터는 5초 후 제거
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        setShowSuccess(false);
      }, 5000);
    }
  }, []);

  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="디토 - 문의하기" />

        <title>문의하기 - 디토DITTO</title>

        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Fav Icon */}
        <link rel="icon" type="image/x-icon" href="/assets/imgs/logo/favicon_32x32.png" />

        {/* Vendor CSS Files */}
        <link rel="stylesheet" href="/assets/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/vendor/fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/vendor/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/vendor/meanmenu.min.css" />
        <link rel="stylesheet" href="/assets/vendor/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/vendor/animate.min.css" />

        {/* Template Main CSS File */}
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>

      <body className="body-wrapper dark body-page-inner font-heading-sequelsans-romanbody">
        {/* Preloader */}
        <div id="preloader">
          <div id="container" className="container-preloader">
            <div className="animation-preloader">
              <div className="spinner"></div>
            </div>
            <div className="loader-section section-left"></div>
            <div className="loader-section section-right"></div>
          </div>
        </div>

        <div className="loading-form">로딩 중...</div>

        {/* Scroll to top */}
        <div className="progress-wrap">
          <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
          </svg>
        </div>

        {/* side toggle start */}
        <aside className="fix">
          <div className="side-info">
            <div className="side-info-content">
              <div className="offset-widget offset-header">
                <div className="offset-logo">
                  <a href="/index.html">
                    <img src="/assets/imgs/logo/dittologo_transparent.png" alt="site logo" />
                  </a>
                </div>
                <button id="side-info-close" className="side-info-close">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="mobile-menu d-xl-none fix"></div>
              <div className="offset-button">
                <a href="/contact" className="rr-btn">
                  <span className="btn-wrap">
                    <span className="text-one">상담하기</span>
                    <span className="text-two">상담하기</span>
                  </span>
                </a>
              </div>
              <div className="offset-widget-box">
                <h2 className="title">연락처</h2>
                <div className="contact-meta">
                  <div className="contact-item">
                    <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                    <span className="text">경기도 평택시 비전1로 35, 101호(비전동)</span>
                  </div>
                  <div className="contact-item">
                    <span className="icon"><i className="fa-solid fa-envelope"></i></span>
                    <span className="text"><a href="mailto:sjlim0114@gmail.com">sjlim0114@gmail.com</a></span>
                  </div>
                  <div className="contact-item">
                    <span className="icon"><i className="fa-solid fa-phone"></i></span>
                    <span className="text"><a href="tel:01032914811">010-3291-4811</a></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <div className="offcanvas-overlay"></div>
        {/* side toggle end */}

        {/* Header area start */}
        <header className="header-area-2">
          <div className="header-main">
            <div className="container large">
              <div className="header-area-2__inner">
                <div className="header__logo">
                  <a href="/index.html">
                    <img src="/assets/imgs/logo/dittologo_transparent.png" className="normal-logo" alt="Site Logo" />
                  </a>
                </div>
                <div className="header__nav pos-center">
                  <nav className="main-menu">
                    <ul>
                      <li><a href="/index.html">홈</a></li>
                      <li><a href="/about.html">회사소개</a></li>
                      <li><a href="/services-4.html">서비스</a></li>
                      <li><a href="/portfolio.html">포트폴리오</a></li>
                      <li><a href="/faq.html">FAQ</a></li>
                      <li><a href="/contact">문의하기</a></li>
                    </ul>
                  </nav>
                </div>
                <div className="header__button">
                  <a href="/contact" className="rr-btn">
                    <span className="btn-wrap">
                      <span className="text-one">상담하기</span>
                      <span className="text-two">상담하기</span>  
                    </span>
                  </a>
                </div>
                <div className="header__navicon">
                  <button className="side-toggle"><img src="/assets/imgs/icon/icon-2.webp" alt="image" /></button>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Header area end */}

        <div className="has-smooth" id="has_smooth"></div>
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <main>
              {/* page title area start */}
              <section className="page-title-area">
                <div className="container large">
                  <div className="page-title-area-inner section-spacing-top">
                    <div className="page-title-wrapper">
                      <h2 className="page-title fade-anim">문의하기</h2>
                    </div>
                  </div>
                </div>
              </section>
              {/* page title area end */}

              {/* contact area start */}
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
                        {/* Remix Form - 기존 form을 이것으로 교체 */}
                        <Form method="post" id="contact__form">
                          <div className="contact-formwrap">
                            <div className="contact-formfield">
                              <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                placeholder="이름*" 
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="contact-formfield">
                              <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                placeholder="이메일*" 
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="contact-formfield">
                              <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                placeholder="연락처*" 
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="contact-formfield">
                              <input 
                                type="text" 
                                name="company" 
                                id="company" 
                                placeholder="회사명"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="contact-formfield">
                              <select 
                                name="Budget" 
                                id="Budget" 
                                required
                                disabled={isSubmitting}
                                defaultValue="0"
                              >
                                <option value="0" disabled>예산*</option>
                                <option value="1">300만원 - 500만원</option>
                                <option value="2">500만원 - 1,000만원</option>
                                <option value="3">1,000만원 - 2,000만원</option>
                                <option value="4">2,000만원 - 3,000만원</option>
                                <option value="5">3,000만원 이상</option>
                              </select>
                            </div>
                            <div className="contact-formfield message">
                              <input 
                                type="text" 
                                name="message" 
                                id="message" 
                                placeholder="메시지*" 
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>

                          {/* 개인정보 수집 동의 */}
                          <div className="privacy-agreement" style={{ margin: "30px 0", padding: "25px", background: "rgba(255,255,255,0.03)", borderRadius: "15px" }}>
                            <h4 style={{ fontSize: "18px", marginBottom: "20px", fontWeight: 600 }}>개인정보 수집 및 이용 동의</h4>
                            
                            <div style={{ marginBottom: "15px" }}>
                              <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", fontSize: "15px", lineHeight: 1.6 }}>
                                <input 
                                  type="checkbox" 
                                  name="privacy_required" 
                                  id="privacy_required" 
                                  required 
                                  disabled={isSubmitting}
                                  style={{ marginRight: "10px", marginTop: "5px" }} 
                                />
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
                                <input 
                                  type="checkbox" 
                                  name="marketing_optional" 
                                  id="marketing_optional" 
                                  disabled={isSubmitting}
                                  style={{ marginRight: "10px", marginTop: "5px" }} 
                                />
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
                            <button type="submit" className="rr-btn" disabled={isSubmitting}>
                              <span className="btn-wrap">
                                <span className="text-one">
                                  {isSubmitting ? "전송 중..." : "메시지 보내기"}
                                </span>
                                <span className="text-two">
                                  {isSubmitting ? "전송 중..." : "메시지 보내기"}
                                </span>
                              </span>
                            </button>
                          </div>
                          
                          {/* 응답 메시지 */}
                          <div id="response-message">
                            {showSuccess && (
                              <div style={{ textAlign: "center", marginTop: "20px", color: "#4ade80", fontSize: "16px" }}>
                                ✅ 견적 요청이 성공적으로 전송되었습니다!<br />
                                빠른 시일 내에 연락드리겠습니다.
                              </div>
                            )}
                            {actionData?.success === false && (
                              <div style={{ textAlign: "center", marginTop: "20px", color: "#f87171", fontSize: "16px" }}>
                                ❌ {actionData.error}
                              </div>
                            )}
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* contact area end */}
            </main>

            {/* footer area start */}
            <footer className="footer-area">
              <div className="container large">
                <div className="footer-top-inner">
                  <div className="footer-logo">
                    <a href="/index.html"><img src="/assets/imgs/logo/dittologo_transparent.png" alt="site-logo" /></a>
                  </div>
                  <div className="info-text">
                    <div className="text-wrapper">
                      <p className="text">고객과 함께 이뤄나가는 UX 및 SEO 친화적 디지털 에이전시</p>
                    </div>
                    <div className="info-link">
                      <a href="mailto:sjlim0114@gmail.com">sjlim0114@gmail.com</a>
                    </div>
                  </div>
                </div>
                <div className="footer-widget-wrapper-box">
                  <div className="footer-widget-wrapper" style={{ justifyContent: "center", gap: "80px" }}>
                    <div className="footer-widget-box">
                      <h2 className="title">Menu</h2>
                      <ul className="footer-nav-list" style={{ fontSize: "14px" }}>
                        <li><a href="/index.html">홈</a></li>
                        <li><a href="/about.html">회사소개</a></li>
                        <li><a href="/services-4.html">서비스</a></li>
                        <li><a href="/portfolio.html">포트폴리오</a></li>
                        <li><a href="/faq.html">FAQ</a></li>
                        <li><a href="/contact">문의하기</a></li>
                      </ul>
                    </div>
                    <div className="footer-widget-box">
                      <h2 className="title">Company</h2>
                      <ul className="footer-nav-list" style={{ fontSize: "14px" }}>
                        <li><a href="/contact">사업자등록번호: 194-32-01775</a></li>
                        <li><a href="/contact">대표자 성명 : 임수진</a></li>
                        <li><a href="/contact">고객센터 : 010-3291-4811</a></li>
                        <li><a href="/contact">이메일 : sjlim0114@gmail.com</a></li>
                        <li><a href="/contact">사업장 소재지 : 경기도 평택시비전1로 35, 101호(비전동)</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="copyright-area">
                <div className="copyright-area-inner" style={{ textAlign: "center" }}>
                  <div className="copyright-text">
                    <p className="text" style={{ fontSize: "16px" }}>© 2025 디토(DITTO) | 
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('이용약관 페이지는 준비 중입니다.'); }} style={{ cursor: "pointer" }}>이용약관</a> | 
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('안녕하세요 고객님!\n디토는 고객님의 개인정보를 소중히 보호합니다.\n서비스 이용을 위해 최소한의 정보만 수집하며,\n언제든지 열람·수정·삭제를 요청하실 수 있습니다.\n방문해주셔서 감사합니다.'); }} style={{ cursor: "pointer" }}>개인정보처리방침</a>
                    </p>
                  </div>
                </div>
              </div>
            </footer>
            {/* footer area end */}
          </div>
        </div>

        {/* 기존 Vendor JS Files 그대로 유지 */}
        <script src="/assets/vendor/jquery-3.7.1.min.js"></script>
        <script src="/assets/vendor/bootstrap.bundle.min.js"></script>
        <script src="/assets/vendor/jquery.magnific-popup.min.js"></script>
        <script src="/assets/vendor/swiper-bundle.min.js"></script>
        <script src="/assets/vendor/ajax-form.js"></script>
        <script src="/assets/vendor/gsap.min.js"></script>
        <script src="/assets/vendor/ScrollSmoother.min.js"></script>
        <script src="/assets/vendor/ScrollToPlugin.min.js"></script>
        <script src="/assets/vendor/ScrollTrigger.min.js"></script>
        <script src="/assets/vendor/SplitText.min.js"></script>
        <script src="/assets/vendor/TextPlugin.js"></script>
        <script src="/assets/vendor/customEase.js"></script>
        <script src="/assets/vendor/jquery.meanmenu.min.js"></script>
        <script src="/assets/vendor/backToTop.js"></script>
        <script src="/assets/vendor/matter.js"></script>
        <script src="/assets/vendor/throwable.js"></script>
        <script src="/assets/js/magiccursor.js"></script>

        {/* Template Main JS File */}
        <script src="/assets/js/main.js"></script>

        {/* Progressive Enhancement - JavaScript 있을 때만 로딩 표시 */}
        {isSubmitting && (
          <div style={{ 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px"
          }}>
            📝 Google Sheets 저장 중...
          </div>
        )}
      </body>
    </html>
  );
}