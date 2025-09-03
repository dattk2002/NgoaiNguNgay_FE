import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaGlobe, 
  FaAward, 
  FaHeart, 
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaHandshake,
  FaStar,
  FaCheck
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  const stats = [
    { number: "50+", label: "Học viên", icon: FaUsers },
    { number: "50+", label: "Gia sư chất lượng", icon: FaGraduationCap },
    { number: "15+", label: "Ngôn ngữ", icon: FaGlobe },
  ];

  const values = [
    {
      icon: FaLightbulb,
      title: "Sáng tạo",
      description: "Luôn đổi mới phương pháp giảng dạy và công nghệ để mang lại trải nghiệm học tập tốt nhất"
    },
    {
      icon: FaShieldAlt,
      title: "Chất lượng",
      description: "Cam kết chất lượng giảng dạy với đội ngũ gia sư được tuyển chọn kỹ lưỡng"
    },
    {
      icon: FaHandshake,
      title: "Tin cậy",
      description: "Xây dựng mối quan hệ tin cậy với học viên và gia sư thông qua minh bạch và công bằng"
    },
    {
      icon: FaRocket,
      title: "Phát triển",
      description: "Khuyến khích sự phát triển không ngừng của cả học viên và gia sư"
    }
  ];

  const team = [
    {
      name: "Tôn Chí Dũng",
      position: "Leader",
    },
    {
      name: "Nguyễn Tiến Linh",
      position: "Member"
    },
    {
      name: "Trần Kim Đạt",
      position: "Member"
    },
    {
      name: "Nguyễn Văn Hiếu",
      position: "Member"
    }
  ];

  const milestones = [
    {
      year: "13/4/2025",
      title: "Ý tưởng thành lập",
      description: "Ý tưởng thành lập Ngoại Ngữ Ngay xuất phát từ mong muốn tạo ra một nền tảng kết nối học viên và gia sư chất lượng, giúp việc học ngoại ngữ trở nên dễ dàng và hiệu quả hơn"
    },
    {
      year: "11/5/2025",
      title: "Thiết kế và phát triển",
      description: "Thiết kế và phát triển nền tảng học trực tuyến và hệ thống quản lý"
    },
    {
      year: "5/9/2025",
      title: "Ra mắt",
      description: "Ra mắt nền tảng học trực tuyến NGOAINGUNGAY"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Về <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Ngoại Ngữ Ngay</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Nền tảng kết nối học viên với gia sư chất lượng, mang đến trải nghiệm học ngoại ngữ 
              hiệu quả và tiện lợi nhất
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Sứ mệnh & Tầm nhìn
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                    <FaRocket className="mr-2" />
                    Sứ mệnh
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Chúng tôi cam kết mang đến cơ hội học ngoại ngữ chất lượng cao cho mọi người, 
                    giúp họ tự tin giao tiếp và mở rộng cơ hội trong cuộc sống và sự nghiệp.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-600 mb-3 flex items-center">
                    <FaStar className="mr-2" />
                    Tầm nhìn
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Trở thành nền tảng giáo dục trực tuyến hàng đầu Việt Nam.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Tại sao chọn chúng tôi?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="w-5 h-5 mr-3 mt-0.5 text-green-300" />
                    <span>Đội ngũ gia sư chất lượng cao, được tuyển chọn kỹ lưỡng</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="w-5 h-5 mr-3 mt-0.5 text-green-300" />
                    <span>Hệ thống quản lý minh bạch, an toàn và bảo mật</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="w-5 h-5 mr-3 mt-0.5 text-green-300" />
                    <span>Hỗ trợ 24/7 và cam kết chất lượng dịch vụ</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những nguyên tắc và giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ phát triển
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những người tiên phong và có tầm nhìn, dẫn dắt Ngoại Ngữ Ngay phát triển
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những cột mốc quan trọng trong quá trình xây dựng và phát triển
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-full lg:w-1/2 ${
                    index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'
                  }`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Sẵn sàng bắt đầu hành trình học ngoại ngữ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Hãy để chúng tôi giúp bạn tìm kiếm gia sư phù hợp nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/become-tutor"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
              >
                Trở thành gia sư
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Tìm gia sư ngay
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
