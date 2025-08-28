import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getLegalDocumentById } from '../components/api/auth';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Stack
} from '@mui/material';
import {
  FaArrowLeft,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaDownload,
  FaShare,
  FaBookOpen,
  FaShieldAlt,
  FaGavel,
  FaBalanceScale,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArchive
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LegalDocumentDetailPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Get document from location state if available (from navigation)
  const documentFromState = location.state?.document;

  useEffect(() => {
    if (documentFromState) {
      setDocument(documentFromState);
      setSelectedVersion(documentFromState.versions?.[0] || null);
      setLoading(false);
    } else if (documentId) {
      fetchDocument();
    }
  }, [documentId, documentFromState]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const documentData = await getLegalDocumentById(documentId);
      setDocument(documentData);
      setSelectedVersion(documentData.versions?.[0] || null);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      toast.error('Không thể tải tài liệu pháp lý');
      navigate('/legal-documents');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/legal-documents');
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'default'; // Draft
      case 1: return 'success'; // Active
      case 2: return 'warning'; // Archived
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Bản nháp';
      case 1: return 'Đang hiệu lực';
      case 2: return 'Đã lưu trữ';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <FaExclamationTriangle />;
      case 1: return <FaCheckCircle />;
      case 2: return <FaArchive />;
      default: return <FaFileAlt />;
    }
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase();
    if (categoryLower?.includes('book') || categoryLower?.includes('thẳng')) return <FaBookOpen />;
    if (categoryLower?.includes('chính sách') || categoryLower?.includes('policy')) return <FaShieldAlt />;
    if (categoryLower?.includes('luật') || categoryLower?.includes('law')) return <FaGavel />;
    if (categoryLower?.includes('quy định') || categoryLower?.includes('regulation')) return <FaBalanceScale />;
    return <FaFileAlt />;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={120} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" width={120} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} />
              </Box>
            </CardContent>
          </Card>
          
          <Paper sx={{ p: 4 }}>
            <Skeleton variant="text" width="30%" height={36} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={300} />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h5" color="#333333" gutterBottom fontWeight="bold">
              Không tìm thấy tài liệu
            </Typography>
            <Button 
              variant="outlined" 
              onClick={handleBack} 
              sx={{ 
                mt: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#333333',
                borderColor: '#333333',
                borderRadius: 1,
                '&:hover': {
                  borderColor: '#333333',
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              Quay lại danh sách
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink
            component={Link}
            to="/legal-documents"
            color="#333333"
            sx={{ 
              textDecoration: 'none', 
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Chính sách pháp lý
          </MuiLink>
          <Typography color="#333333">
            {document.name}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<FaArrowLeft />}
            onClick={handleBack}
            variant="outlined"
            sx={{ 
              mb: 3,
              color: '#333333',
              borderColor: '#333333',
              borderRadius: 1,
              '&:hover': {
                borderColor: '#333333',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {/* Document Header */}
        <Card sx={{ mb: 4, borderRadius: 1, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 1, 
                  bgcolor: '#f5f5f5',
                  color: '#333333',
                  fontSize: '1.5rem'
                }}
              >
                {getCategoryIcon(document.category)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#333333' }}>
                  {document.name}
                </Typography>
                
                <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip 
                    label={document.category} 
                    variant="outlined"
                    icon={getCategoryIcon(document.category)}
                    sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#333333', borderColor: '#333333' }}
                  />
                  {document.versions && document.versions.length > 0 && (
                    <Chip 
                      label={`${document.versions.length} phiên bản`} 
                      variant="outlined"
                      sx={{ fontWeight: 600, color: '#333333', borderColor: '#333333' }}
                    />
                  )}
                </Stack>
                
                <Typography variant="body1" color="#333333" sx={{ mb: 3, lineHeight: 1.6, opacity: 0.8 }}>
                  {document.description || 'Không có mô tả'}
                </Typography>
                
                <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaCalendarAlt style={{ fontSize: 14, color: '#333333' }} />
                    <Typography variant="body2" color="#333333" fontWeight={500} sx={{ opacity: 0.7 }}>
                      Tạo: {formatDate(document.createdTime)}
                    </Typography>
                  </Box>
                  
                  {document.lastUpdatedTime && document.lastUpdatedTime !== document.createdTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaClock style={{ fontSize: 14, color: '#333333' }} />
                      <Typography variant="body2" color="#333333" fontWeight={500} sx={{ opacity: 0.7 }}>
                        Cập nhật: {formatDate(document.lastUpdatedTime)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                size="medium"
                startIcon={<FaEye />}
                onClick={() => {
                  toast.info('Tính năng xem tài liệu đang được phát triển');
                }}
                sx={{
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  bgcolor: '#333333',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: '#000000'
                  }
                }}
              >
                Xem tài liệu
              </Button>
              
              <Button
                variant="outlined"
                size="medium"
                startIcon={<FaDownload />}
                onClick={() => {
                  toast.info('Tính năng tải xuống đang được phát triển');
                }}
                sx={{
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333333',
                  borderColor: '#333333',
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: '#333333',
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Tải xuống
              </Button>
              
              <Button
                variant="outlined"
                size="medium"
                startIcon={<FaShare />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Đã sao chép link vào clipboard');
                }}
                sx={{
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333333',
                  borderColor: '#333333',
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: '#333333',
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Chia sẻ
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 1, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#333333', mb: 3 }}>
            Nội dung tài liệu
          </Typography>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}
          >
            <Typography 
              variant="body1" 
              component="div"
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                fontSize: '1rem',
                color: '#333333'
              }}
            >
              {document.description || 'Không có nội dung chi tiết'}
            </Typography>
          </Paper>
        </Paper>

        {/* Document Versions */}
        {document.versions && document.versions.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 1, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#333333', mb: 3 }}>
              Phiên bản tài liệu
            </Typography>
            
            <Stack gap={3}>
              {/* Version Selector */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {document.versions.map((version) => (
                  <Chip
                    key={version.id}
                    label={`Phiên bản ${version.version}`}
                    onClick={() => handleVersionSelect(version)}
                    variant={selectedVersion?.id === version.id ? "filled" : "outlined"}
                    icon={getStatusIcon(version.status)}
                    sx={{ 
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      color: selectedVersion?.id === version.id ? 'white' : '#333333',
                      bgcolor: selectedVersion?.id === version.id ? '#333333' : 'transparent',
                      borderColor: '#333333',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: selectedVersion?.id === version.id ? '#333333' : '#f5f5f5'
                      }
                    }}
                  />
                ))}
              </Box>
              
              {/* Selected Version Content */}
              {selectedVersion && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#333333' }}>
                      Phiên bản {selectedVersion.version}
                    </Typography>
                    <Chip 
                      label={getStatusText(selectedVersion.status)} 
                      color={getStatusColor(selectedVersion.status)}
                      icon={getStatusIcon(selectedVersion.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="#333333" sx={{ mb: 3, opacity: 0.7 }}>
                    Ngày tạo: {formatDate(selectedVersion.createdTime)}
                  </Typography>
                  
                  <Box sx={{ 
                    bgcolor: 'white', 
                    p: 3, 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1
                  }}>
                    <Typography 
                      variant="body1" 
                      component="div"
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.7,
                        fontSize: '1rem',
                        color: '#333333'
                      }}
                    >
                      {selectedVersion.content || 'Không có nội dung'}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Paper>
        )}

        {/* Additional Information */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#333333', mb: 3 }}>
            Thông tin bổ sung
          </Typography>
          
          <Stack gap={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#333333' }}>
                Thông tin kỹ thuật
              </Typography>
              <Stack gap={1}>
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  <strong>ID:</strong> {document.id}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  <strong>Danh mục:</strong> {document.category}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  <strong>Ngày tạo:</strong> {formatDate(document.createdTime)}
                </Typography>
                {document.lastUpdatedTime && (
                  <Typography variant="body2" sx={{ color: '#333333' }}>
                    <strong>Cập nhật lần cuối:</strong> {formatDate(document.lastUpdatedTime)}
                  </Typography>
                )}
                {document.versions && (
                  <Typography variant="body2" sx={{ color: '#333333' }}>
                    <strong>Số phiên bản:</strong> {document.versions.length}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LegalDocumentDetailPage;
