import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BecomeATutorLandingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    const benefits = [
        {
            icon: "💰",
            title: "Thu nhập linh hoạt",
            description: "Tự đặt giá và quản lý lịch trình của bạn. Kiếm tiền từ đam mê giảng dạy."
        },
        {
            icon: "🌍",
            title: "Kết nối toàn cầu",
            description: "Dạy học viên từ khắp nơi trên thế giới, mở rộng tầm nhìn văn hóa."
        },
        {
            icon: "⏰",
            title: "Thời gian tự do",
            description: "Làm việc theo giờ giấc phù hợp với lối sống của bạn."
        },
        {
            icon: "📚",
            title: "Phát triển bản thân",
            description: "Nâng cao kỹ năng giảng dạy và giao tiếp qua mỗi buổi học."
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Đăng ký hồ sơ",
            description: "Điền thông tin cá nhân, chuyên môn và tải lên ảnh đại diện."
        },
        {
            number: "02",
            title: "Xác minh tài khoản",
            description: "Đội ngũ của chúng tôi sẽ xem xét và phê duyệt hồ sơ trong 1-3 ngày."
        },
        {
            number: "03",
            title: "Thiết lập lớp học",
            description: "Tạo các khóa học, đặt giá và lịch dạy theo sở thích."
        },
        {
            number: "04",
            title: "Bắt đầu dạy học",
            description: "Nhận học viên đầu tiên và bắt đầu hành trình giảng dạy."
        }
    ];

    const faqs = [
        {
            question: "Tôi có cần bằng cấp giảng dạy không?",
            answer: "Không nhất thiết! Chúng tôi chào đón cả gia sư chuyên nghiệp và người bản ngữ có đam mê chia sẻ kiến thức."
        },
        {
            question: "Tôi có thể kiếm được bao nhiều?",
            answer: "Thu nhập phụ thuộc vào kinh nghiệm, số giờ dạy và giá bạn đặt. Gia sư có thể kiếm từ 200.000 - 1.000.000 VNĐ/tháng."
        },
        {
            question: "Tôi cần thiết bị gì để bắt đầu?",
            answer: "Chỉ cần máy tính/laptop có camera, micro và kết nối internet ổn định là đủ để bắt đầu."
        },
        {
            question: "Bao lâu để được duyệt hồ sơ?",
            answer: "Thường mất 1-3 ngày làm việc để xem xét hồ sơ. Chúng tôi sẽ thông báo qua email khi có kết quả."
        }
    ];

    const stats = [
        { number: "10,000+", label: "Gia sư hoạt động" },
        { number: "50,000+", label: "Học viên hài lòng" },
        { number: "100+", label: "Quốc gia" },
        { number: "24/7", label: "Hỗ trợ" }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-[#333333] text-white py-20">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Trở thành Gia sư
                            <span className="block text-white-300">Thay đổi cuộc sống</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                            Chia sẻ kiến thức, kết nối với học viên trên toàn thế giới và xây dựng sự nghiệp giảng dạy trực tuyến của riêng bạn
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/become-tutor/register')}
                                className="bg-gray-300 hover:bg-white text-black hover:text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Bắt đầu ngay
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300">
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-black mb-2">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tại sao chọn chúng tôi?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Khám phá những lợi ích tuyệt vời khi trở thành gia sư trên nền tảng của chúng tôi
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="text-4xl mb-4">{benefit.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Quy trình đăng ký
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Chỉ 4 bước đơn giản để bắt đầu hành trình giảng dạy của bạn
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                    </div>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Câu hỏi thường gặp
                        </h2>
                        <p className="text-xl text-gray-600">
                            Những thắc mắc phổ biến từ các gia sư
                        </p>
                    </div>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <button
                                    onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform ${activeTab === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {activeTab === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#333333] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Sẵn sàng bắt đầu hành trình của bạn?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Tham gia cộng đồng gia sư và bắt đầu kiếm tiền từ kiến thức của bạn ngay hôm nay
                    </p>
                    <button
                        onClick={() => navigate('/become-tutor/register')}
                        className="bg-gray-300 hover:bg-white text-black hover:text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Đăng ký ngay
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* Footer */}

        </div>
    );
};

export default BecomeATutorLandingPage; 