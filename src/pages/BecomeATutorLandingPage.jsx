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
            title: "Tải lên chứng chỉ",
            description: "Upload các chứng chỉ, bằng cấp liên quan đến chuyên môn giảng dạy của bạn."
        },
        {
            number: "03",
            title: "Xác minh tài khoản",
            description: "Đội ngũ của chúng tôi sẽ xem xét và phê duyệt hồ sơ trong 1-3 ngày."
        },
        {
            number: "04",
            title: "Thiết lập lớp học",
            description: "Tạo các khóa học, đặt giá và lịch dạy theo sở thích."
        },
        {
            number: "05",
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Trở thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Gia sư</span>
                        <span className="block text-gray-900">Thay đổi cuộc sống</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10">
                        Chia sẻ kiến thức, kết nối với học viên trên toàn thế giới và xây dựng sự nghiệp giảng dạy trực tuyến của riêng bạn
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/become-tutor/register')}
                            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Bắt đầu ngay
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105">
                            Tìm hiểu thêm
                        </button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Tại sao chọn chúng tôi?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Khám phá những lợi ích tuyệt vời khi trở thành gia sư trên nền tảng của chúng tôi
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="text-6xl mb-4">{benefit.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Quy trình đăng ký
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Chỉ 5 bước đơn giản để bắt đầu hành trình giảng dạy của bạn
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white p-6 rounded-2xl shadow-lg h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                                            <span className="text-lg font-bold text-white">{step.number}</span>
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-sm text-gray-600 text-center leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                                        <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Câu hỏi thường gặp
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Những thắc mắc phổ biến từ các gia sư
                        </p>
                    </div>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <button
                                    onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                                >
                                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                                    <svg
                                        className={`w-6 h-6 text-blue-500 transition-transform duration-300 ${activeTab === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {activeTab === index && (
                                    <div className="px-8 pb-6">
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Sẵn sàng bắt đầu hành trình của bạn?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                        Tham gia cộng đồng gia sư và bắt đầu kiếm tiền từ kiến thức của bạn ngay hôm nay
                    </p>
                    <button
                        onClick={() => navigate('/become-tutor/register')}
                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Đăng ký ngay
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default BecomeATutorLandingPage; 