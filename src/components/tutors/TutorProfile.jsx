import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Avatar,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Rating,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getAccessToken } from '../../components/api/auth';
import { formatLanguageCode } from '../../utils/formatLanguageCode';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#f0f7ff',
    color: '#333333',
    fontWeight: 500,
    margin: theme.spacing(0.5),
    borderRadius: '4px',
    height: '32px',
    '&.MuiChip-colorSuccess': {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    '&.MuiChip-colorError': {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    '&.MuiChip-colorWarning': {
        backgroundColor: '#fff7ed',
        color: '#9a3412',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#1a56db',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#1e429f',
    },
    '&.MuiButton-outlined': {
        backgroundColor: 'transparent',
        color: '#1a56db',
        borderColor: '#1a56db',
        '&:hover': {
            backgroundColor: '#f0f4ff',
        },
    },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(18),
    height: theme.spacing(18),
    margin: '0 auto 16px',
    border: '4px solid white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontSize: '3.5rem',
    backgroundColor: '#c4c4c4',
    color: 'white',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    position: 'relative',
    paddingBottom: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: '#333333',
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '40px',
        height: '3px',
        backgroundColor: theme.palette.primary.main,
    },
}));

const VerificationBadge = styled(Box)(({ status, theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: 600,
    ...(status === 0 && {
        backgroundColor: '#fff7ed',
        color: '#9a3412',
    }),
    ...(status === 1 && {
        backgroundColor: '#f0f7ff',
        color: '#1e429f',
    }),
    ...(status === 2 && {
        backgroundColor: '#dcfce7',
        color: '#166534',
    }),
}));

const getProficiencyLabel = (level) => {
    switch (level) {
        case 1: return "Beginner (A1)";
        case 2: return "Elementary (A2)";
        case 3: return "Intermediate (B1)";
        case 4: return "Upper Intermediate (B2)";
        case 5: return "Advanced (C1)";
        case 6: return "Proficient (C2)";
        case 7: return "Native";
        default: return "Unknown";
    }
};

const getLanguageName = (code) => {
    return formatLanguageCode(code);
};

const getVerificationStatus = (status) => {
    switch (status) {
        case 0: return { label: "Pending Verification", color: '#b45309' };
        case 1: return { label: "Under Review", color: '#1e429f' };
        case 2: return { label: "Verified", color: '#166534' };
        default: return { label: "Unknown Status", color: '#64748b' };
    }
};

const TutorProfile = ({ user, onRequireLogin, fetchTutorDetail }) => {
    const { id } = useParams();
    const [tutorData, setTutorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);

    // Fetch tutor data when component mounts
    useEffect(() => {
        const fetchTutorData = async () => {
            setLoading(true);
            try {
                if (!fetchTutorDetail) {
                    throw new Error("Fetch tutor detail function not provided");
                }

                const response = await fetchTutorDetail(id);
                console.log("Tutor data:", response);

                if (response && response.data) {
                    setTutorData(response.data);
                    // If there are availability slots, set them
                    if (response.data.availabilityPatterns && response.data.availabilityPatterns.length > 0) {
                        setTimeSlots(response.data.availabilityPatterns);
                    }
                } else {
                    throw new Error("Invalid data format received from server");
                }
            } catch (error) {
                console.error("Error fetching tutor data:", error);
                setError(error.message || "Failed to load tutor profile");
                if (error.message === "Authentication token is required") {
                    onRequireLogin && onRequireLogin();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTutorData();
    }, [id, fetchTutorDetail, onRequireLogin]);

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading tutor profile...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    component={Link}
                    to="/languages"
                    sx={{ mt: 2 }}
                >
                    Return to Tutor List
                </Button>
            </Container>
        );
    }

    if (!tutorData) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="warning">
                    No tutor data available. The tutor may have been removed or is no longer active.
                </Alert>
                <Button
                    variant="contained"
                    component={Link}
                    to="/languages"
                    sx={{ mt: 2 }}
                >
                    Return to Tutor List
                </Button>
            </Container>
        );
    }

    const verificationInfo = getVerificationStatus(tutorData.verificationStatus);

    return (
        <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <StyledPaper sx={{ textAlign: 'center', position: 'relative', p: 4, width: '100%' }}>
                        <Box sx={{ position: 'relative', pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                {tutorData.profilePictureUrl ? (
                                    <LargeAvatar src={tutorData.profilePictureUrl} alt={tutorData.fullName} />
                                ) : (
                                    <LargeAvatar>{tutorData.fullName ? tutorData.fullName.charAt(0).toUpperCase() : "N"}</LargeAvatar>
                                )}
                            </Box>

                            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, color: '#1e293b', width: '100%', textAlign: 'center' }}>
                                {tutorData.nickName || tutorData.fullName}
                            </Typography>

                            {tutorData.nickName && tutorData.fullName !== tutorData.nickName && (
                                <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b', width: '100%', textAlign: 'center' }}>
                                    ({tutorData.fullName})
                                </Typography>
                            )}

                            <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: verificationInfo.color,
                                        fontWeight: 500
                                    }}
                                >
                                    {verificationInfo.label}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="h6">Email</SectionTitle>
                            <Typography variant="body2" sx={{ color: '#64748b', wordBreak: 'break-word' }}>
                                {tutorData.email}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="h6">Teaching Languages</SectionTitle>
                            {tutorData.languages && tutorData.languages.length > 0 ? (
                                tutorData.languages.map((lang, index) => (
                                    <Box key={index} sx={{
                                        mb: 2,
                                        p: 2,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#334155'
                                                }}
                                            >
                                                {getLanguageName(lang.languageCode)}
                                            </Typography>
                                            {lang.isPrimary && (
                                                <Chip
                                                    label="Primary"
                                                    size="small"
                                                    sx={{
                                                        height: '20px',
                                                        fontSize: '0.625rem',
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                            <Rating
                                                value={lang.proficiency}
                                                max={7}
                                                readOnly
                                                size="small"
                                                sx={{
                                                    mr: 1,
                                                    '& .MuiRating-iconFilled': {
                                                        color: '#f59e0b',
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                {getProficiencyLabel(lang.proficiency)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                    No language information available
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 4, width: '100%' }}>
                            <StyledButton
                                variant="contained"
                                fullWidth
                                disabled={tutorData.verificationStatus !== 2}
                                sx={{
                                    py: 1.5,
                                    backgroundColor: '#e2e8f0',
                                    color: '#64748b',
                                    '&:hover': {
                                        backgroundColor: '#e2e8f0',
                                    }
                                }}
                            >
                                BOOK A LESSON
                            </StyledButton>

                            {tutorData.verificationStatus !== 2 && (
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b', textAlign: 'center' }}>
                                    Booking will be available once the tutor is verified
                                </Typography>
                            )}
                        </Box>
                    </StyledPaper>

                    <StyledPaper sx={{ width: '100%' }}>
                        <SectionTitle variant="h6">Certifications & Skills</SectionTitle>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: 2 }}>
                            {tutorData.hashtags && tutorData.hashtags.length > 0 ? (
                                tutorData.hashtags.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        title={tag.description}
                                        sx={{
                                            backgroundColor: '#f1f5f9',
                                            color: '#0f172a',
                                            borderRadius: '4px',
                                            height: '32px',
                                            fontWeight: 500,
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                    No certifications listed
                                </Typography>
                            )}
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={8}>
                    <StyledPaper>
                        <SectionTitle variant="h6">About Me</SectionTitle>
                        {tutorData.brief && (
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 3,
                                    fontWeight: 500,
                                    color: '#334155',
                                    fontStyle: 'italic'
                                }}
                            >
                                "{tutorData.brief}"
                            </Typography>
                        )}

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#334155' }}>
                            {tutorData.description || "No description provided."}
                        </Typography>
                    </StyledPaper>

                    <StyledPaper>
                        <SectionTitle variant="h6">Teaching Method</SectionTitle>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#334155' }}>
                            {tutorData.teachingMethod || "No teaching method information provided."}
                        </Typography>
                    </StyledPaper>

                    <StyledPaper>
                        <SectionTitle variant="h6">Availability Schedule</SectionTitle>

                        {timeSlots && timeSlots.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>Day</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {timeSlots.map((slot, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{slot.dayOfWeek}</TableCell>
                                                <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                                                <TableCell>
                                                    <StyledChip
                                                        label={slot.isAvailable ? "Available" : "Unavailable"}
                                                        color={slot.isAvailable ? "success" : "error"}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                This tutor hasn't set their availability schedule yet.
                            </Alert>
                        )}
                    </StyledPaper>

                    <StyledPaper>
                        <SectionTitle variant="h6">FAQs</SectionTitle>

                        <Accordion sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important' }}>
                            <AccordionSummary
                                expandIcon={"▼"}
                                sx={{ borderRadius: '8px' }}
                            >
                                <Typography sx={{ fontWeight: 500 }}>How do I book a lesson with this tutor?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    You can book a lesson by clicking the "Book a Lesson" button on the tutor's profile. Select an available time slot from the tutor's schedule and confirm your booking.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important' }}>
                            <AccordionSummary
                                expandIcon={"▼"}
                                sx={{ borderRadius: '8px' }}
                            >
                                <Typography sx={{ fontWeight: 500 }}>What payment methods are accepted?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    We accept credit/debit cards, PayPal, and bank transfers for payments. All transactions are secure and encrypted.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important' }}>
                            <AccordionSummary
                                expandIcon={"▼"}
                                sx={{ borderRadius: '8px' }}
                            >
                                <Typography sx={{ fontWeight: 500 }}>What is the cancellation policy?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    You can cancel or reschedule a lesson up to 24 hours before the scheduled time without any penalty. Late cancellations may result in a partial charge.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </StyledPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TutorProfile; 