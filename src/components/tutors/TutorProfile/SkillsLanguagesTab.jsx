import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FiPlusCircle, FiCheck } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { getProficiencyLabel, getLanguageName } from "./utils";
import { verificationColors } from "./constants";

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const SkillsLanguagesTab = ({
  tutorData,
  documents,
  documentsLoading,
  documentsError,
  isOwner,
  handleCertificateUpload,
  handleRequestVerification,
  handleRemoveCertificate,
}) => {
  // File input ref for certificate upload
  const fileInputRef = React.useRef(null);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleCertificateUpload(files);
    }
  };

  const getVerificationColor = (status) => {
    return verificationColors[status] || verificationColors.UNVERIFIED;
  };

  const getVerificationText = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'Đã xác minh';
      case 'PENDING_VERIFICATION':
        return 'Đang chờ xác minh';
      case 'UNVERIFIED':
      default:
        return 'Chưa xác minh';
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        minWidth: 0,
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
      }}
      role="tabpanel"
    >
      {/* Languages Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Ngôn ngữ</SectionTitle>
        {tutorData?.tutorLanguages && tutorData.tutorLanguages.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tutorData.tutorLanguages.map((lang, index) => (
              <Chip
                key={index}
                label={`${getLanguageName(lang.languageCode)} - ${getProficiencyLabel(lang.proficiencyLevel)}`}
                color="primary"
                variant="outlined"
                sx={{
                  borderRadius: "16px",
                  fontWeight: "medium",
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chưa có thông tin ngôn ngữ
          </Typography>
        )}
      </Box>

      {/* Verification Status */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Trạng thái xác minh</SectionTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Chip
            icon={tutorData?.verificationStatus === 'VERIFIED' ? <FiCheck /> : null}
            label={getVerificationText(tutorData?.verificationStatus)}
            sx={{
              backgroundColor: getVerificationColor(tutorData?.verificationStatus),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          {isOwner && tutorData?.verificationStatus !== 'VERIFIED' && (
            <StyledButton
              onClick={handleRequestVerification}
              size="small"
              disabled={tutorData?.verificationStatus === 'PENDING_VERIFICATION'}
            >
              {tutorData?.verificationStatus === 'PENDING_VERIFICATION' 
                ? 'Đang chờ xác minh' 
                : 'Yêu cầu xác minh'}
            </StyledButton>
          )}
        </Box>
        
        {tutorData?.verificationStatus === 'PENDING_VERIFICATION' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Yêu cầu xác minh của bạn đang được xử lý. Chúng tôi sẽ liên hệ sớm nhất có thể.
          </Alert>
        )}
        
        {tutorData?.verificationStatus === 'VERIFIED' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Tài khoản của bạn đã được xác minh thành công!
          </Alert>
        )}
      </Box>

      {/* Certificates Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <SectionTitle variant="h6" sx={{ mb: 0 }}>Chứng chỉ</SectionTitle>
          {isOwner && (
            <StyledButton
              startIcon={<FiPlusCircle />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              Thêm chứng chỉ
            </StyledButton>
          )}
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {documentsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : documentsError ? (
          <Alert severity="error">{documentsError}</Alert>
        ) : documents && documents.length > 0 ? (
          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px -8px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doc.documentName}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                      {doc.documentType}
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip
                        label={doc.verificationStatus === 'VERIFIED' ? 'Đã xác minh' : 
                               doc.verificationStatus === 'PENDING' ? 'Đang chờ' : 'Chưa xác minh'}
                        size="small"
                        color={doc.verificationStatus === 'VERIFIED' ? 'success' : 
                               doc.verificationStatus === 'PENDING' ? 'warning' : 'default'}
                      />
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                      >
                        Xem
                      </Button>
                      
                      {isOwner && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveCertificate(doc)}
                        >
                          Xóa
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "grey.50",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isOwner ? "Chưa có chứng chỉ nào. Hãy thêm chứng chỉ để tăng độ tin cậy." : "Gia sư chưa có chứng chỉ nào."}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default SkillsLanguagesTab;
