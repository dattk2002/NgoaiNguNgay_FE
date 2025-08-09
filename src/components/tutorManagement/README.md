# Offer Management System

## Overview
The Offer Management system allows tutors to view, manage, and delete their booking offers. This system provides a clean interface for tutors to track their offers and their current status.

## Components

### 1. OfferManagement.jsx
**Main component for displaying and managing offers**

**Features:**
- Displays a list of all tutor booking offers
- Shows offer details including learner information, lesson details, and pricing
- Provides action buttons for viewing details and deleting offers
- Displays offer status (expired/active) and pricing information
- Responsive design with clean card-based layout
- Includes built-in delete confirmation modal

**Key Functions:**
- `fetchOffers()`: Retrieves all offers from the API
- `handleViewDetail(offer)`: Opens the detail modal for a specific offer
- `handleDeleteOffer(offer)`: Initiates the delete confirmation process
- `confirmDeleteOffer()`: Executes the offer deletion

**UI Elements:**
- Offer cards showing learner name, lesson name, and creation date
- Time slots display with formatted dates
- Status indicators (expired/active)
- Price information (total price, price per slot, duration)
- Action buttons (Detail, Delete)
- Delete confirmation modal with loading states

### 2. OfferDetailModal.jsx
**Modal component for displaying comprehensive offer details**

**Features:**
- Displays detailed information about a specific offer
- Shows learner information, lesson details, and tutor information
- Lists all proposed time slots with formatted dates
- Displays pricing breakdown and offer status
- Clean, organized layout with color-coded sections

**Information Displayed:**
- Basic offer information (status, creation date, expiration date)
- Learner details (name, profile picture URL)
- Lesson information (lesson name)
- Proposed time slots with formatted dates
- Pricing information (total price, price per slot, duration)
- Tutor information (name, profile picture URL)

### 3. DeleteConfirmModal (Built-in)
**Confirmation modal for offer deletion**

**Features:**
- Confirms user intent before deleting an offer
- Clear warning message about the irreversible action
- Simple two-button interface (Cancel/Delete)
- Loading states during deletion process
- Consistent styling with LoginModal design patterns
- Shows learner name instead of technical offer ID

## API Integration

### Used API Endpoints:
- `getAllTutorBookingOffer()`: Fetches all offers for the current tutor
- `deleteTutorBookingOfferByOfferId(offerId)`: Deletes a specific offer

### API Response Structure:
```javascript
{
  "data": [
    {
      "id": "offer_id",
      "pricePerSlot": 20000,
      "durationInMinutes": 30,
      "lessonId": "lesson_id",
      "lessonName": "Lesson Name",
      "totalPrice": 120000,
      "createdAt": "2025-08-01T10:56:39.282582Z",
      "updatedAt": null,
      "expirationTime": "2025-08-01T11:26:39.282582Z",
      "isExpired": true,
      "tutor": {
        "id": "tutor_id",
        "fullName": "Tutor Name",
        "profilePictureUrl": "url",
        "gender": 2
      },
      "learner": {
        "id": "learner_id",
        "fullName": "Learner Name",
        "profilePictureUrl": "url",
        "gender": 0
      },
      "offeredSlots": [
        {
          "slotDateTime": "2025-08-01T19:30:00Z",
          "slotIndex": 5
        }
      ]
    }
  ]
}
```

## Key Features

### 1. User-Friendly Display
- **No Technical IDs**: The interface shows meaningful names instead of technical IDs
- **Clean Titles**: Offer titles show "Offer từ [Learner Name]" instead of offer IDs
- **Readable Information**: Focuses on user-friendly information like names and lesson titles
- **Consistent Design**: Follows the same design patterns as other modals in the application

### 2. Status Management
- **Expiration Status**: Clearly shows whether offers are expired or active
- **Visual Indicators**: Color-coded status badges (red for expired, green for active)
- **Time Information**: Shows creation and expiration dates

### 3. Pricing Information
- **Total Price**: Prominently displayed in green
- **Per-Slot Pricing**: Shows individual slot pricing
- **Duration**: Displays lesson duration in minutes
- **Formatted Display**: Prices are formatted with commas for readability

### 4. Time Slot Management
- **Multiple Slots**: Supports multiple time slots per offer
- **Formatted Dates**: Displays dates in Vietnamese locale format
- **Slot Indexing**: Shows slot numbers for easy reference

## Styling

### Color Scheme:
- **Primary Text**: `text-gray-900` for headings and labels
- **Secondary Text**: `text-gray-600` for values and descriptions
- **Status Colors**: 
  - Expired: `bg-red-100 text-red-800`
  - Active: `bg-green-100 text-green-800`
- **Price Highlight**: `text-green-600` for total price
- **Action Buttons**: 
  - Detail: `bg-green-100 text-green-700`
  - Delete: `bg-red-100 text-red-700`

### Layout:
- **Responsive Grid**: Cards adapt to different screen sizes
- **Clean Spacing**: Consistent padding and margins
- **Card Design**: White cards with subtle borders and shadows
- **Modal Design**: Full-screen overlay with centered content

## Error Handling

### Loading States:
- Spinner animation while fetching data
- Clear loading indicators

### Error States:
- Error messages for failed API calls
- Retry functionality for failed requests
- Graceful fallbacks for missing data

### Empty States:
- Helpful messages when no offers exist
- Clear call-to-action for empty states

## Performance Considerations

### Optimizations:
- **Efficient Rendering**: Uses React.motion for smooth animations
- **Conditional Rendering**: Only renders modals when needed
- **State Management**: Minimal state for optimal performance
- **API Caching**: Efficient data fetching and state updates

## Future Enhancements

### Potential Improvements:
1. **Search Functionality**: Add search by learner name or lesson name
2. **Sorting Options**: Sort by date, price, or status
3. **Bulk Actions**: Select multiple offers for bulk operations
4. **Export Functionality**: Export offer data to CSV/PDF
5. **Real-time Updates**: WebSocket integration for live updates
6. **Advanced Filtering**: Filter by date range, price range, or status
7. **Pagination**: Handle large numbers of offers efficiently
8. **Create/Edit Functionality**: Add ability to create new offers or edit existing ones (if needed in future)

## Usage

### For Tutors:
1. Navigate to the Offer Management tab
2. View all your current and past offers
3. Click "Chi tiết" to see detailed information
4. Click "Xóa" to delete offers (with confirmation)
5. Monitor offer status and expiration dates

### For Developers:
1. Import the components as needed
2. Ensure API endpoints are properly configured
3. Customize styling through Tailwind classes
4. Extend functionality by adding new features

## Dependencies

### Required Packages:
- `react`: Core React functionality
- `framer-motion`: For smooth animations
- `tailwindcss`: For styling

### Utility Functions:
- `formatPriceWithCommas`: Price formatting utility
- `formatTutorDate`: Date formatting utility

## File Structure

```
src/components/tutorManagement/
├── OfferManagement.jsx          # Main offer management component (includes DeleteConfirmModal)
├── OfferDetailModal.jsx         # Detailed offer view modal
├── README.md                    # This documentation
└── [Other tutor management files]
```

**Note:** The DeleteConfirmModal is built into the OfferManagement.jsx component for better maintainability and consistency.

## Integration

The Offer Management system is integrated into the main tutor dashboard through the `TutorManagementDashboard.jsx` component, providing a dedicated tab for offer management alongside other tutor functionalities.
