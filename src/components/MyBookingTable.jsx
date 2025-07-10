import React from "react";
import {
  Avatar,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table as MuiTable,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { LuMessageCircleMore } from "react-icons/lu";
import { FiTrash2, FiXCircle, FiCheckCircle } from "react-icons/fi";
import {
  learnerBookingTimeSlotByTutorId,
  learnerBookingOfferDetail,
} from "./api/auth"; // add learnerBookingOfferDetail

function getWeekInfoForDialog() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  const weekInfo = [];
  const dayLabels = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "CN",
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekInfo.push({
      label: dayLabels[i],
      date: d.getDate(),
    });
  }
  return weekInfo;
}

export default function MyBookingTable({
  sentRequests,
  loadingRequests,
  onMessageTutor,
  onDeleteRequest,
}) {
  // Dialog state
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] =
    React.useState(false);
  const [bookingDetailLoading, setBookingDetailLoading] = React.useState(false);
  const [bookingDetailSlots, setBookingDetailSlots] = React.useState([]);
  const [bookingDetailExpectedStartDate, setBookingDetailExpectedStartDate] =
    React.useState(""); // NEW
  const [selectedTutor, setSelectedTutor] = React.useState(null);
  const [offerDetail, setOfferDetail] = React.useState(null);
  const [tutorOfferedSlots, setTutorOfferedSlots] = React.useState([]);

  // Handler to open dialog and fetch booking detail
  const handleOpenBookingDetail = async (tutorId, tutorBookingOfferId) => {
    setBookingDetailLoading(true);
    setBookingDetailDialogOpen(true);
    setSelectedTutor(tutorId);
    setTutorOfferedSlots([]); // reset
    try {
      const res = await learnerBookingTimeSlotByTutorId(tutorId);
      console.log("API response for booking detail:", res);
      // Support both { data: { ... } } and { ... }
      const detail = res?.data ? res.data : res;
      setBookingDetailSlots(
        Array.isArray(detail?.timeSlots) ? detail.timeSlots : []
      );
      setBookingDetailExpectedStartDate(detail?.expectedStartDate || "");

      // If there is an offer, fetch its detail
      if (tutorBookingOfferId) {
        const offer = await learnerBookingOfferDetail(tutorBookingOfferId);
        setOfferDetail(offer);
        setTutorOfferedSlots(
          Array.isArray(offer?.offeredSlots) ? offer.offeredSlots : []
        );
      }
    } catch (err) {
      setBookingDetailSlots([]);
      setBookingDetailExpectedStartDate("");
      setOfferDetail(null);
      setTutorOfferedSlots([]);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full">
        {/* Heading OUTSIDE the card */}

        <div className="overflow-x-auto rounded-lg shadow-md max-w-[1500px] w-[100%]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Ảnh gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Thời gian gửi yêu cầu
                </th>
                {/* NEW COLUMN */}
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loadingRequests ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="circular" width={44} height={44} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={120} height={28} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={160} height={28} />
                    </td>
                    {/* NEW SKELETON CELL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={100} height={28} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="rectangular" width={60} height={28} />
                    </td>
                  </tr>
                ))
              ) : sentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} align="center" className="py-8">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        width="64"
                        height="64"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="text-gray-300 mb-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-gray-400 text-sm">
                        Không có yêu cầu nào.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                sentRequests.map((req, idx) => (
                  <tr
                    key={req.tutorId}
                    className={
                      (idx % 2 === 0
                        ? "bg-white hover:bg-blue-50 transition-colors duration-150"
                        : "bg-gray-50 hover:bg-blue-50 transition-colors duration-150") +
                      " cursor-pointer"
                    }
                    onClick={() =>
                      handleOpenBookingDetail(
                        req.tutorId,
                        req.tutorBookingOfferId
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Avatar
                        src={req.tutorAvatarUrl}
                        alt={req.tutorName}
                        sx={{
                          width: 44,
                          height: 44,
                          border: "2px solid #e0e7ef",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography className="text-[#333333] font-medium">
                        {req.tutorName}
                      </Typography>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography className="text-gray-700">
                        {new Date(req.latestRequestTime).toLocaleString()}
                      </Typography>
                    </td>
                    {/* STATUS CELL - NO FLEX */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {req.tutorBookingOfferId ? (
                          <>
                            <FiCheckCircle className="text-green-500" />
                            <span className="text-green-600 font-medium">
                              Đã được đề xuất
                            </span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="text-red-500" />
                            <span className="text-red-600 font-medium">
                              Chưa được đề xuất
                            </span>
                          </>
                        )}
                      </span>
                    </td>
                    {/* ACTIONS CELL - NO FLEX */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMessageTutor(req.tutorId);
                          }}
                          title="Nhắn tin với gia sư"
                          className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          style={{
                            fontSize: 22,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LuMessageCircleMore />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(req.tutorId);
                          }}
                          title="Xóa yêu cầu"
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          style={{
                            fontSize: 22,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      {bookingDetailDialogOpen && (
        <Dialog
          open={bookingDetailDialogOpen}
          onClose={() => setBookingDetailDialogOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{ sx: { minWidth: 1100 } }}
        >
          <DialogTitle>
            Chi tiết khung giờ đã đặt{" "}
            {selectedTutor &&
              `- Gia sư: ${
                sentRequests.find((t) => t.tutorId === selectedTutor)
                  ?.tutorName || ""
              }`}
          </DialogTitle>
          <DialogContent>
            {/* Show expectedStartDate if available */}
            {bookingDetailExpectedStartDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Ngày bắt đầu dự kiến:{" "}
                  {new Date(bookingDetailExpectedStartDate).toLocaleString()}
                </Typography>
              </Box>
            )}
            {bookingDetailLoading ? (
              <MuiTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Thứ 2</TableCell>
                    <TableCell>Thứ 3</TableCell>
                    <TableCell>Thứ 4</TableCell>
                    <TableCell>Thứ 5</TableCell>
                    <TableCell>Thứ 6</TableCell>
                    <TableCell>Thứ 7</TableCell>
                    <TableCell>CN</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 16 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton variant="text" width="80%" height={24} />
                      </TableCell>
                      {Array.from({ length: 7 }).map((__, dayIdx) => (
                        <TableCell key={dayIdx}>
                          <Skeleton
                            variant="rectangular"
                            width="80%"
                            height={24}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </MuiTable>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "140px repeat(7, 1fr)",
                    minWidth: "900px",
                  }}
                >
                  {/* Header row */}
                  <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                    Thời gian
                  </Box>
                  {(() => {
                    // You need to generate weekInfo for the header
                    const weekInfo = getWeekInfoForDialog();
                    return weekInfo.map((d, i) => (
                      <Box
                        key={i}
                        sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}
                      >
                        <div style={{ fontSize: 14 }}>{d.label}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {d.date}
                        </div>
                      </Box>
                    ));
                  })()}
                  {/* Time slots */}
                  {Array.from({ length: 48 }).map((_, slotIdx) => {
                    const hour = Math.floor(slotIdx / 2);
                    const minute = slotIdx % 2 === 0 ? "00" : "30";
                    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
                    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
                    const timeLabel = `${hour
                      .toString()
                      .padStart(2, "0")}:${minute} - ${nextHour
                      .toString()
                      .padStart(2, "0")}:${nextMinute}`;
                    const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1];
                    return (
                      <React.Fragment key={slotIdx}>
                        {/* Time label cell */}
                        <Box
                          sx={{
                            p: 1,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #e2e8f0",
                            borderRight: "1px solid #e2e8f0",
                            minHeight: 32,
                          }}
                        >
                          {timeLabel}
                        </Box>
                        {/* For each day, render a cell for this 30-min slot */}
                        {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                          const isBooked =
                            Array.isArray(bookingDetailSlots) &&
                            bookingDetailSlots.some(
                              (slot) =>
                                slot.dayInWeek === dayInWeek &&
                                slot.slotIndex === slotIdx
                            );
                          const isOffered =
                            Array.isArray(tutorOfferedSlots) &&
                            tutorOfferedSlots.some((slot) => {
                              const slotDate = new Date(slot.slotDateTime);
                              const jsDay = slotDate.getDay();
                              const slotDayInWeek = jsDay === 0 ? 1 : jsDay + 1;
                              return (
                                slot.slotIndex === slotIdx &&
                                slotDayInWeek === dayInWeek
                              );
                            });
                          let bgColor = "#f1f5f9";
                          let color = "#333";
                          let fontWeight = 400;
                          if (isBooked && isOffered) {
                            bgColor = "#a259e6"; // purple
                            color = "#333";
                            fontWeight = 700;
                          } else if (isBooked) {
                            bgColor = "#FFD700"; // yellow
                            color = "#333";
                            fontWeight = 700;
                          } else if (isOffered) {
                            bgColor = "#3b82f6"; // blue
                            color = "#fff";
                            fontWeight = 700;
                          }
                          return (
                            <Box
                              key={dayIdx}
                              sx={{
                                backgroundColor: bgColor,
                                border: "1px solid #e2e8f0",
                                minHeight: 32,
                                textAlign: "center",
                                color,
                                fontWeight,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {/* No text */}
                            </Box>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              pb: 2,
              width: "100%", // Ensure full width for spacing
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#FFD700",
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#bfa100" }}>
                  Học viên đã đặt
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#3b82f6" }}>
                  Đề xuất của gia sư
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#a259e6",
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#a259e6" }}>
                  Học viên đã đặt + Gia sư đã đề xuất
                </Typography>
              </Box>
            </Box>
            <Box>
              <Button onClick={() => setBookingDetailDialogOpen(false)}>
                Đóng
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
