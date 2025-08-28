import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getAllLegalDocumentCategories, 
  getLegalDocumentByCategory 
} from '../components/api/auth';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Grid,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  Fade,
  Zoom,
  Grow
} from '@mui/material';
import {
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaTimes,
  FaBookOpen,
  FaShieldAlt,
  FaGavel,
  FaBalanceScale,
  FaSearch,
  FaArrowRight,
  FaEye,
  FaDownload
} from 'react-icons/fa';

const LegalDocumentsPage = () => {
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch documents when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchDocuments(selectedCategory, 1);
    } else {
      setDocuments([]);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getAllLegalDocumentCategories();
      setCategories(categoriesData);
      
      // Auto-select first category if available
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Không thể tải danh mục tài liệu pháp lý');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (category, page = 1, append = false) => {
    try {
      setLoadingDocuments(true);
      const documentsData = await getLegalDocumentByCategory(category, page, 10);
      
      if (append) {
        setDocuments(prev => [...prev, ...documentsData]);
      } else {
        setDocuments(documentsData);
      }
      
      setCurrentPage(page);
      setHasMore(documentsData.length === 10);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Không thể tải tài liệu pháp lý');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingDocuments) {
      fetchDocuments(selectedCategory, currentPage + 1, true);
    }
  };

  const handleDocumentClick = (document) => {
    navigate(`/legal-documents/${document.id}`, { 
      state: { document } 
    });
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

  const clearFilter = () => {
    setSelectedCategory('');
    setDocuments([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('book') || categoryLower.includes('thẳng')) return <FaBookOpen />;
    if (categoryLower.includes('chính sách') || categoryLower.includes('policy')) return <FaShieldAlt />;
    if (categoryLower.includes('luật') || categoryLower.includes('law')) return <FaGavel />;
    if (categoryLower.includes('quy định') || categoryLower.includes('regulation')) return <FaBalanceScale />;
    return <FaFileAlt />;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'white',
        pt: 4
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={28} />
          </Box>
          
          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Skeleton variant="text" width="30%" height={36} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" width={140} height={40} />
              ))}
            </Box>
          </Paper>
          
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'white',
      pt: 4
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              color: '#333333', 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Chính sách pháp lý
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#333333', 
              maxWidth: 600, 
              mx: 'auto',
              fontWeight: 400,
              opacity: 0.6
            }}
          >
            Tìm hiểu về các chính sách và quy định pháp lý của chúng tôi
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper elevation={0} sx={{ 
          p: 2, 
          mb: 4, 
          bgcolor: 'white',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm tài liệu pháp lý..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch style={{ color: '#333333', fontSize: 18 }} />
                </InputAdornment>
              ),
              style: { fontSize: '1rem', padding: '8px 12px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: '#333333',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#333333',
                },
              },
            }}
          />
        </Paper>

        {/* Category Filters */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'white',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<FaFilter />}
              sx={{
                bgcolor: '#333333',
                color: 'white',
                borderRadius: 1,
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#000000'
                }
              }}
            >
              Danh mục tài liệu
            </Button>
            {selectedCategory && (
              <Tooltip title="Xóa bộ lọc">
                <IconButton 
                  size="small" 
                  onClick={clearFilter}
                  sx={{ 
                    color: '#333333',
                    bgcolor: '#f5f5f5',
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                      color: '#333333'
                    }
                  }}
                >
                  <FaTimes />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {categories.map((category, index) => (
              <Chip
                key={category}
                label={category}
                onClick={() => handleCategorySelect(category)}
                variant={selectedCategory === category ? "filled" : "outlined"}
                icon={getCategoryIcon(category)}
                sx={{
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedCategory === category ? 600 : 500,
                  px: 2,
                  py: 1,
                  height: 'auto',
                  color: selectedCategory === category ? 'white' : '#333333',
                  bgcolor: selectedCategory === category ? '#333333' : 'transparent',
                  borderColor: '#333333',
                  borderWidth: 1.5,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: selectedCategory === category ? '#333333' : '#f5f5f5',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  },
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Documents Section */}
        {selectedCategory ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                startIcon={getCategoryIcon(selectedCategory)}
                sx={{
                  bgcolor: '#333333',
                  color: 'white',
                  borderRadius: 1,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#000000'
                  }
                }}
              >
                {selectedCategory}
              </Button>
              <Chip 
                label={`${filteredDocuments.length} tài liệu`} 
                size="medium" 
                variant="outlined"
                sx={{ 
                  color: '#333333',
                  borderColor: '#333333',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1
                }}
              />
            </Box>

            {loadingDocuments && documents.length === 0 ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
                  </Grid>
                ))}
              </Grid>
            ) : filteredDocuments.length === 0 ? (
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
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <FaFileAlt style={{ fontSize: 40, color: '#333333' }} />
                </Box>
                <Typography variant="h5" color="#333333" gutterBottom fontWeight="bold">
                  Không tìm thấy tài liệu
                </Typography>
                <Typography variant="body1" color="#333333" sx={{ maxWidth: 400, mx: 'auto', opacity: 0.6 }}>
                  {searchTerm 
                    ? `Không có tài liệu nào phù hợp với từ khóa "${searchTerm}"`
                    : 'Chưa có tài liệu pháp lý nào trong danh mục này'
                  }
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredDocuments.map((document, index) => (
                  <Grid item xs={12} md={6} key={document.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          borderColor: '#333333',
                          '& .document-actions': {
                            opacity: 1,
                            transform: 'translateY(0)'
                          }
                        }
                      }}
                      onClick={() => handleDocumentClick(document)}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1, 
                              bgcolor: '#f5f5f5',
                              color: '#333333',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 50,
                              height: 50
                            }}
                          >
                            {getCategoryIcon(document.category)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                              lineHeight: 1.3, 
                              color: '#333333',
                              mb: 1
                            }}>
                              {document.name}
                            </Typography>
                            <Chip 
                              label={document.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600, 
                                color: '#333333', 
                                borderColor: '#333333',
                                bgcolor: '#f5f5f5',
                                fontSize: '0.8rem'
                              }}
                            />
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="#333333" 
                          sx={{ 
                            mb: 3, 
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                            fontSize: '0.9rem',
                            opacity: 0.7
                          }}
                        >
                          {document.description || 'Không có mô tả'}
                        </Typography>
                        
                        <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaCalendarAlt style={{ fontSize: 14, color: '#333333', opacity: 0.6 }} />
                            <Typography variant="caption" color="#333333" fontWeight={500} sx={{ opacity: 0.6 }}>
                              {formatDate(document.createdTime)}
                            </Typography>
                          </Box>
                          
                          {document.versions && document.versions.length > 0 && (
                            <Chip 
                              label={`${document.versions.length} phiên bản`} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600, 
                                color: '#333333', 
                                borderColor: '#333333',
                                bgcolor: '#f5f5f5',
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Stack>
                        
                        {document.lastUpdatedTime && document.lastUpdatedTime !== document.createdTime && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FaClock style={{ fontSize: 12, color: '#333333', opacity: 0.4 }} />
                            <Typography variant="caption" color="#333333" sx={{ opacity: 0.4 }}>
                              Cập nhật: {formatDate(document.lastUpdatedTime)}
                            </Typography>
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Box 
                          className="document-actions"
                          sx={{ 
                            opacity: 0,
                            transform: 'translateY(8px)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            gap: 1,
                            mt: 2
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={<FaEye />}
                            sx={{
                              color: '#333333',
                              fontSize: '0.8rem',
                              '&:hover': {
                                bgcolor: '#f5f5f5'
                              }
                            }}
                          >
                            Xem
                          </Button>
                          <Button
                            size="small"
                            startIcon={<FaDownload />}
                            sx={{
                              color: '#333333',
                              fontSize: '0.8rem',
                              '&:hover': {
                                bgcolor: '#f5f5f5'
                              }
                            }}
                          >
                            Tải
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoadMore}
                  disabled={loadingDocuments}
                  endIcon={<FaArrowRight />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    bgcolor: '#333333',
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#000000',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    },
                    '&:disabled': {
                      bgcolor: '#cccccc',
                      color: '#999999'
                    }
                  }}
                >
                  {loadingDocuments ? 'Đang tải...' : 'Tải thêm tài liệu'}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
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
            <Box sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4
            }}>
              <FaFilter style={{ fontSize: 50, color: '#333333' }} />
            </Box>
            <Typography variant="h4" color="#333333" gutterBottom fontWeight="bold">
              Chọn danh mục để xem tài liệu
            </Typography>
            <Typography variant="body1" color="#333333" sx={{ maxWidth: 400, mx: 'auto', mb: 4, opacity: 0.6 }}>
              Vui lòng chọn một danh mục từ bên trên để xem các tài liệu pháp lý
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => categories.length > 0 && handleCategorySelect(categories[0])}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                bgcolor: '#333333',
                color: 'white',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: '#000000',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              Xem tài liệu đầu tiên
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default LegalDocumentsPage;
