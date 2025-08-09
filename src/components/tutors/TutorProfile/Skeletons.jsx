import React from "react";
import { 
  Box, 
  Container,
  Grid, 
  Paper, 
  Skeleton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from "@mui/material";

export const WeeklyScheduleSkeleton = () => (
  <TableContainer component={Paper} sx={{ mb: 3 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell width="12%">
            <Skeleton variant="text" width="80%" />
          </TableCell>
          {Array.from({ length: 7 }, (_, index) => (
            <TableCell key={index} align="center">
              <Skeleton variant="text" width="60%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <Skeleton variant="text" width="100%" />
            </TableCell>
            {Array.from({ length: 7 }, (_, colIndex) => (
              <TableCell key={colIndex} align="center">
                <Skeleton variant="rectangular" width={24} height={24} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export const BookingDetailSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="50%" height={24} sx={{ mb: 3 }} />
    
    <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
    <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} variant="rectangular" width={80} height={32} sx={{ borderRadius: 4 }} />
      ))}
    </Box>
    
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><Skeleton variant="text" width="80%" /></TableCell>
            {Array.from({ length: 7 }, (_, index) => (
              <TableCell key={index} align="center">
                <Skeleton variant="text" width="60%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell><Skeleton variant="text" width="100%" /></TableCell>
              {Array.from({ length: 7 }, (_, colIndex) => (
                <TableCell key={colIndex} align="center">
                  <Skeleton variant="rectangular" width={24} height={24} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export const TutorProfileSkeleton = () => (
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    <Grid container spacing={4}>
      {/* Left Column Skeleton */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Paper
          sx={{
            textAlign: "center",
            position: "relative",
            p: 4,
            width: "100%",
            borderRadius: "16px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton variant="circular" width={160} height={160} />
            <Skeleton variant="text" width={120} height={40} sx={{ mt: 2 }} />
            <Skeleton variant="text" width={80} height={24} sx={{ mt: 1 }} />
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ mt: 3, borderRadius: 2 }}
            />
          </Box>
        </Paper>
      </Grid>
      
      {/* Right Column Skeleton */}
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Paper
          sx={{
            p: 0,
            minHeight: "700px",
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
          }}
        >
          {/* Tab Skeleton */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, pt: 3 }}>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Skeleton variant="text" width={120} height={32} />
              <Skeleton variant="text" width={140} height={32} />
              <Skeleton variant="text" width={80} height={32} />
            </Box>
          </Box>
          
          {/* Content Skeleton */}
          <Box sx={{ p: 3, flex: 1 }}>
            {/* Email Section */}
            <Skeleton variant="text" width="25%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="60%"
              height={36}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* About Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={60}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* Teaching Method Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* Schedule Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={120} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton
                variant="rectangular"
                width={80}
                height={32}
                sx={{ borderRadius: 2 }}
              />
            </Box>
            <WeeklyScheduleSkeleton />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Container>
);
