import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';

export default function Documentation() {
  const downloadDocumentation = () => {
    const doc = `
# ÉduPortail - Complete Project Documentation

## Table of Contents
1. Project Overview
2. Technology Stack
3. Features & Functionality
4. Database Architecture
5. Component Structure
6. Authentication & Security
7. API Endpoints & Functions
8. User Flows
9. Deployment & Configuration

---

## 1. PROJECT OVERVIEW

### Project Name
**ÉduPortail** (formerly Lost & Found Hub)

### Purpose
ÉduPortail is a comprehensive campus lost and found management system designed specifically for Chitkara University. It enables students and staff to report lost items, post found items, and facilitate the reunion of lost belongings with their rightful owners through an intelligent matching system.

### Key Objectives
- Streamline the process of reporting and finding lost items on campus
- Enable secure communication between item finders and owners
- Provide smart matching to connect lost and found items
- Maintain a secure, institution-specific platform (restricted to @chitkara.edu.in emails)
- Offer real-time notifications for matching items

---

## 2. TECHNOLOGY STACK

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6.30.1
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query v5 for server state
- **Animations**: Tailwind CSS animations + Framer Motion patterns
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Theming**: next-themes for dark/light mode support

### Backend & Cloud Services
- **Backend Platform**: Lovable Cloud (Supabase-powered)
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime for notifications
- **Edge Functions**: Supabase Edge Functions (Deno runtime)
- **Email Service**: Resend API for OTP and notifications

### Database Extensions
- **pg_trgm**: PostgreSQL trigram extension for fuzzy text matching and similarity search

### Development Tools
- **Package Manager**: Bun
- **Type Checking**: TypeScript 5.x
- **Linting**: ESLint
- **Code Quality**: Prettier (implicit through Lovable)

---

## 3. FEATURES & FUNCTIONALITY

### 3.1 Authentication System
**Email-Restricted Access**
- Only @chitkara.edu.in email addresses allowed
- Email verification required on signup
- JWT-based session management

**Two-Factor Authentication (2FA)**
- Mandatory OTP verification on login
- OTP sent via email using Resend service
- Time-limited OTP codes (expiration enforced)
- Secure OTP storage in database

**Strong Password Policy**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Real-time password strength validation

**Password Management**
- Secure password reset flow
- Email-based password reset links
- Password confirmation for sensitive actions

### 3.2 Item Management

**Report Lost Items**
- Title, description, category selection
- Location and date of loss
- Optional image upload
- Optional reward information
- Contact information (email/phone)
- Automatic activity logging

**Report Found Items**
- Title, description, category selection
- Location and date found
- Image upload support
- Contact information
- Automatic activity logging

**Item Categories**
- Electronics
- Clothing
- Accessories
- Documents
- Keys
- Bags
- Books
- Jewelry
- Sports Equipment
- Other

**Item Status Tracking**
- Pending (actively listed)
- Claimed (claim initiated)
- Returned (successfully returned)
- Expired (no longer active)

### 3.3 Smart Matching System
**Automatic Matching**
- Uses PostgreSQL pg_trgm extension for similarity search
- Matches items based on title similarity (>0.3 threshold)
- Considers opposite types (lost ↔ found)
- Real-time notification generation on matches
- Displays match percentage on item detail pages

**Matching Algorithm**
- Trigram-based text similarity
- Category consideration
- Location proximity (future enhancement)
- Date range matching (future enhancement)

### 3.4 Claim System
**Found Items Only**
- Claim feature restricted to found items only
- No claim option for lost items (business logic constraint)
- Contact information reveal upon claim initiation
- Claim status tracking (pending, approved, rejected)
- Notification to item owner on new claims

**Claim Process**
1. User views found item
2. User submits claim with message
3. Item owner receives notification
4. Owner reviews claim and contact information
5. Direct communication enabled between parties

### 3.5 Chat System (Owner ↔ Finder)
**Real-time Messaging**
- Direct messaging between item owner and claimer
- Real-time updates via Supabase Realtime
- Message persistence in database
- Only participants of a claim can chat
- Secure RLS policies ensure privacy

**Chat Features**
- Send text messages in real-time
- View message history
- Timestamp display for each message
- Sender identification
- Message notifications
- Sequential message display

### 3.6 Notification System
**Real-time Notifications**
- Powered by Supabase Realtime
- Instant notification updates without page refresh
- Notification dropdown in navbar

**Notification Types**
- Matching item found (when similar item added)
- New claim on your item
- Claim status updates
- System announcements

**Notification Features**
- Unread count badge
- Mark as read functionality
- Timestamp display
- Link to related item
- Notification persistence

### 3.7 Social Sharing
**Share Lost Items**
- WhatsApp sharing with pre-filled message
- Twitter/X sharing with hashtags and link
- Facebook sharing with item details
- Shareable URLs for each item

**Sharing Features**
- Item title, description, and link included
- Platform-specific formatting
- Increases item visibility
- Enhances recovery chances

### 3.8 User Profile & Settings

**Profile Management**
- Avatar upload and management
- Display name and full name
- Email (non-editable, verified)
- Phone number (optional)
- Profile statistics (items reported, claims made)
- Activity timeline

**Profile Settings Tabs**
1. **Profile Tab**
   - Avatar management
   - Personal information editing
   - Profile visibility settings

2. **Security Tab**
   - Two-factor authentication toggle
   - Password change functionality
   - Active sessions management (future)

3. **Account Tab**
   - Account deletion (with password confirmation)
   - Data export options (future)
   - Privacy settings

### 3.9 Activity Timeline
**Comprehensive Activity Tracking**
- All user actions logged with timestamps
- Activity types tracked:
  - Items reported (lost/found)
  - Claims made
  - Profile updates
  - Messages sent (future)
  - Appointments scheduled (future)

**Automatic Cleanup**
- Database function runs periodically
- Deletes activities older than 90 days
- Maintains database performance
- Keeps recent history accessible

**Activity Display**
- Chronological timeline view
- Activity type icons
- Detailed descriptions
- Timestamp display
- Filterable by type (future enhancement)

### 3.10 Browse & Search
**Browse Items**
- View all lost and found items
- Filter by type (lost/found)
- Filter by category
- Sort by date (newest/oldest)
- Grid view with responsive layout

**Search Functionality**
- Full-text search across titles and descriptions
- Real-time search results
- Category-based filtering
- Location-based filtering (future)

### 3.11 Theme Support
**Dark/Light Mode**
- System preference detection
- Manual toggle in navbar
- Theme persistence across sessions
- Smooth theme transitions
- Custom color palette for both modes

**Design System**
- Dark Purple & Green color scheme
- HSL-based color tokens
- Semantic color naming
- Consistent spacing and typography
- Gradient backgrounds and accents

---

## 4. DATABASE ARCHITECTURE

### 4.1 Tables

**profiles**
- id (uuid, PK, references auth.users)
- email (text, unique, not null)
- full_name (text, not null)
- phone (text, nullable)
- avatar_url (text, nullable)
- two_factor_enabled (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)

**items**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- type (enum: 'lost' | 'found')
- category (enum: electronics, clothing, accessories, documents, keys, bags, books, jewelry, sports, other)
- title (text, not null)
- description (text, not null)
- location (text, not null)
- date_lost_found (date, not null)
- image_url (text, nullable)
- contact_info (text, nullable)
- reward (text, nullable)
- status (enum: pending, claimed, returned, expired)
- created_at (timestamp)
- updated_at (timestamp)

**claims**
- id (uuid, PK)
- item_id (uuid, FK → items.id)
- claimer_id (uuid, FK → profiles.id)
- message (text, not null)
- status (text, default: 'pending')
- created_at (timestamp)
- updated_at (timestamp)

**notifications**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- item_id (uuid, FK → items.id)
- matched_item_id (uuid, FK → items.id)
- title (text, not null)
- message (text, not null)
- read (boolean, default: false)
- created_at (timestamp)

**activities**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- activity_type (text, not null)
- description (text, not null)
- metadata (jsonb, nullable)
- created_at (timestamp)

**otp_codes**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- code (text, not null)
- expires_at (timestamp, not null)
- verified (boolean, default: false)
- created_at (timestamp)

**messages**
- id (uuid, PK)
- claim_id (uuid, FK → claims.id)
- sender_id (uuid, FK → profiles.id)
- receiver_id (uuid, FK → profiles.id)
- content (text, not null)
- created_at (timestamp)

### 4.2 Row-Level Security (RLS) Policies

**profiles**
- Users can view all profiles (SELECT: true)
- Users can insert own profile (INSERT: auth.uid() = id)
- Users can update own profile (UPDATE: auth.uid() = id)

**items**
- Anyone can view all items (SELECT: true)
- Authenticated users can insert items (INSERT: auth.uid() = user_id)
- Users can update own items (UPDATE: auth.uid() = user_id)
- Users can delete own items (DELETE: auth.uid() = user_id)

**claims**
- Users can view own claims and claims on their items (SELECT)
- Authenticated users can create claims (INSERT: auth.uid() = claimer_id)
- Item owners can update claims (UPDATE)

**notifications**
- Users can view own notifications (SELECT: auth.uid() = user_id)
- Users can update own notifications (UPDATE: auth.uid() = user_id)

**activities**
- Users can view own activities (SELECT: auth.uid() = user_id)

**otp_codes**
- Users can view own OTP codes (SELECT: auth.uid() = user_id)
- Users can insert own OTP codes (INSERT: auth.uid() = user_id)
- Users can update own OTP codes (UPDATE: auth.uid() = user_id)

**messages**
- Users can view messages if they are sender or receiver (SELECT)
- Users can insert messages if they are sender or receiver (INSERT)

### 4.3 Database Functions

**cleanup_old_activities()**
- Deletes activity records older than 90 days
- Runs periodically to maintain database performance
- Returns void

**log_activity()**
- Trigger function for automatic activity logging
- Inserts activity records on table changes
- Used by multiple triggers

**check_matching_items()**
- Trigger function for smart matching
- Finds similar items using pg_trgm similarity
- Creates notifications for both parties
- Runs on item insertion

**cleanup_expired_otps()**
- Deletes expired OTP codes
- Maintains OTP table cleanliness

### 4.4 Database Triggers

**log_item_activity**
- Fires on items table INSERT
- Logs item creation activity

**log_claim_activity**
- Fires on claims table INSERT
- Logs claim creation activity

**log_profile_activity**
- Fires on profiles table UPDATE
- Logs profile update activity

**check_matching_items_trigger**
- Fires on items table INSERT
- Checks for matching items and creates notifications

### 4.5 Indexes

**items table**
- idx_items_user_id on user_id (for user's items queries)
- idx_items_type on type (for filtering by lost/found)
- idx_items_status on status (for filtering by status)
- idx_items_title_gin using GIN (for full-text search)

**notifications table**
- idx_notifications_user_id on user_id (for user's notifications)
- idx_notifications_read on read (for unread notifications)

**activities table**
- idx_activities_user_id on user_id (for user's activities)
- idx_activities_created_at on created_at (for timeline queries)

---

## 5. COMPONENT STRUCTURE

### 5.1 Pages

**Home (/)**
- Landing page with hero section
- Feature highlights
- Call-to-action buttons
- Statistics display
- Recent items preview

**Auth (/auth)**
- Combined login/signup form
- Password strength validation
- Forgot password flow
- Email verification notice
- Responsive split layout

**AuthWithOTP (/auth-otp)**
- OTP verification page
- OTP input with 6 digits
- Resend OTP functionality
- Auto-submit on completion

**Dashboard (/dashboard)**
- Protected route (requires authentication)
- User's items overview
- Quick action cards
- Recent activity summary
- Navigation to other sections

**Browse (/browse)**
- Public item listing
- Filter by type (lost/found)
- Filter by category
- Search functionality
- Pagination support
- Responsive grid layout

**ItemDetail (/item/:id)**
- Detailed item information
- Image gallery/display
- Contact information (conditional)
- Claim button (found items only)
- Social sharing buttons
- Smart matching suggestions
- Owner information

**ReportItem (/report-lost, /report-found)**
- Item reporting form
- Category selection
- Date picker
- Location input
- Image upload
- Form validation
- Success confirmation

**Profile (/profile)**
- User profile display
- Profile statistics
- Recent items reported
- Recent claims made
- Activity timeline
- Edit profile button

**Settings (/settings)**
- Tabbed interface (Profile, Security, Account)
- Avatar management
- Profile information editing
- 2FA toggle
- Account deletion

**NotFound (/404)**
- 404 error page
- Navigation back to home
- Animated design

### 5.2 Components

**Navbar**
- Responsive navigation bar
- Theme toggle (dark/light)
- Notifications dropdown
- User avatar/menu (authenticated)
- Auth buttons (unauthenticated)
- Mobile hamburger menu

**NavLink**
- Active route highlighting
- Smooth hover transitions
- Reusable navigation link component

**NotificationsDropdown**
- Real-time notification display
- Unread count badge
- Mark as read functionality
- Click to navigate to item
- Dropdown menu interface

**ProtectedRoute**
- HOC for route protection
- Authentication check
- Loading state display
- Redirect to /auth if unauthenticated

### 5.3 UI Components (Shadcn/ui)
- Accordion
- Alert & Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Button (with variants)
- Calendar
- Card (Header, Content, Footer)
- Carousel
- Chart
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Form (with React Hook Form integration)
- Hover Card
- Input (text, password, OTP)
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Slider
- Sonner (Toast notifications)
- Switch
- Table
- Tabs
- Textarea
- Toast & Toaster
- Toggle & Toggle Group
- Tooltip

### 5.4 Hooks

**use-toast**
- Toast notification management
- Success, error, info variants
- Auto-dismiss configuration

**use-mobile**
- Responsive breakpoint detection
- Mobile-specific UI logic

**useAuth (custom)**
- Authentication context consumer
- User state management
- Auth actions (sign in, sign up, sign out)

### 5.5 Contexts

**AuthContext**
- Global authentication state
- User object
- Session object
- Auth methods (signIn, signUp, signOut, resetPassword)
- Loading state

**ThemeContext (next-themes)**
- Theme state (light/dark/system)
- Theme toggle functionality
- CSS variable management

---

## 6. AUTHENTICATION & SECURITY

### 6.1 Authentication Flow

**Signup Flow**
1. User enters email (must be @chitkara.edu.in)
2. User creates password (meets strength requirements)
3. User enters full name
4. Email verification sent (Supabase Auth)
5. User verifies email via link
6. Profile created in database
7. User redirected to dashboard

**Login Flow**
1. User enters email and password
2. Credentials verified (Supabase Auth)
3. OTP generated and sent to email (Resend)
4. User redirected to OTP verification page
5. User enters 6-digit OTP
6. OTP verified against database
7. Session created (JWT token)
8. User redirected to dashboard

**Password Reset Flow**
1. User clicks "Forgot Password"
2. User enters email
3. Password reset email sent (Supabase Auth)
4. User clicks link in email
5. User redirected to reset password page
6. User enters new password (meets requirements)
7. Password updated in Supabase Auth
8. User redirected to login

### 6.2 Security Measures

**Email Restriction**
- Only @chitkara.edu.in emails accepted
- Client-side validation
- Server-side validation in edge functions

**Password Security**
- Strong password policy enforced
- Passwords hashed by Supabase Auth (bcrypt)
- Never stored in plain text
- Password strength indicator on signup

**Two-Factor Authentication**
- OTP-based 2FA (mandatory)
- OTPs expire after 10 minutes
- OTPs stored hashed in database
- One-time use (marked as verified after use)

**JWT Tokens**
- Secure session management
- Token expiration (configurable)
- Token refresh on activity
- HTTP-only cookies (Supabase handles)

**Row-Level Security**
- All tables protected by RLS policies
- User can only access own data
- Public read for items table only
- Owner-based write permissions

**Input Validation**
- Zod schema validation on forms
- Server-side validation in edge functions
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

**File Upload Security**
- File type validation
- File size limits
- Secure storage in Supabase Storage
- Public read, authenticated write policies

---

## 7. API ENDPOINTS & FUNCTIONS

### 7.1 Supabase Auth API
- POST /auth/v1/signup - User registration
- POST /auth/v1/token - Login (password grant)
- POST /auth/v1/recover - Password reset request
- POST /auth/v1/verify - Email verification
- POST /auth/v1/logout - Sign out

### 7.2 Supabase Database API (PostgREST)
- GET /rest/v1/profiles - List profiles
- POST /rest/v1/profiles - Create profile
- PATCH /rest/v1/profiles - Update profile
- GET /rest/v1/items - List items (with filters)
- POST /rest/v1/items - Create item
- PATCH /rest/v1/items - Update item
- DELETE /rest/v1/items - Delete item
- GET /rest/v1/claims - List claims
- POST /rest/v1/claims - Create claim
- PATCH /rest/v1/claims - Update claim status
- GET /rest/v1/notifications - List notifications
- PATCH /rest/v1/notifications - Mark as read
- GET /rest/v1/activities - List user activities

### 7.3 Edge Functions

**send-otp**
- POST /functions/v1/send-otp
- Generates 6-digit OTP
- Stores in otp_codes table
- Sends email via Resend API
- Request body: { email: string }
- Response: { success: boolean, message: string }

**send-contact-email**
- POST /functions/v1/send-contact-email
- Forwards contact form to admin email
- Uses Resend API
- Request body: { email: string, name: string, message: string }
- Response: { success: boolean }

### 7.4 Supabase Storage API
- POST /storage/v1/object/avatars - Upload avatar
- DELETE /storage/v1/object/avatars - Delete avatar
- POST /storage/v1/object/items - Upload item image
- DELETE /storage/v1/object/items - Delete item image

### 7.5 Supabase Realtime
- WebSocket connection to /realtime/v1
- Subscribe to notifications table changes
- Subscribe to items table changes (future)
- Subscribe to claims table changes (future)

---

## 8. USER FLOWS

### 8.1 First-Time User Journey
1. User visits homepage
2. User clicks "Get Started" or "Sign Up"
3. User fills signup form (email, password, name)
4. User receives email verification link
5. User verifies email
6. User logs in with credentials
7. User receives OTP via email
8. User enters OTP
9. User completes profile setup
10. User explores dashboard

### 8.2 Report Lost Item Flow
1. User navigates to "Report Lost Item"
2. User fills form (title, description, category, location, date, image)
3. User submits form
4. Item saved to database
5. Activity logged in timeline
6. Smart matching triggered (notifications sent if matches found)
7. User redirected to item detail page
8. User can share on social media

### 8.3 Report Found Item Flow
1. User navigates to "Report Found Item"
2. User fills form (title, description, category, location, date, image)
3. User submits form
4. Item saved to database
5. Activity logged in timeline
6. Smart matching triggered (notifications sent if matches found)
7. User redirected to item detail page
8. Other users can now claim this item

### 8.4 Claim Found Item Flow
1. User browses found items
2. User clicks on an item
3. User views item details
4. User clicks "Claim Item" button
5. User writes claim message
6. Claim submitted to database
7. Item owner receives notification
8. Contact information revealed to both parties
9. Parties communicate directly (email/phone)
10. Item status updated to "claimed"

### 8.5 Smart Matching Flow
1. User reports lost item "iPhone 13"
2. Database trigger executes check_matching_items()
3. Function searches for found items with similar titles using pg_trgm
4. Finds found item "iPhone 13 Pro"
5. Similarity score calculated (>0.3 threshold)
6. Notification created for both users
7. Both users receive real-time notification
8. Users click notification to view potential match
9. Users review and decide if items match
10. If match, users proceed with claim/contact flow

### 8.6 Notification Flow
1. Matching item triggers notification creation
2. Notification inserted into database
3. Supabase Realtime broadcasts change
4. NotificationsDropdown component receives update
5. Unread count badge updates
6. User clicks notification icon
7. Dropdown shows unread notifications
8. User clicks notification
9. Notification marked as read
10. User navigated to related item page

---

## 9. DEPLOYMENT & CONFIGURATION

### 9.1 Environment Variables
- VITE_SUPABASE_URL - Supabase project URL
- VITE_SUPABASE_PUBLISHABLE_KEY - Supabase anon key
- VITE_SUPABASE_PROJECT_ID - Supabase project ID

### 9.2 Supabase Configuration

**Authentication Settings**
- Email provider enabled
- Email verification required
- Auto-confirm disabled (requires manual verification)
- Password requirements enforced
- Session timeout: 7 days (default)

**Storage Buckets**
- avatars bucket (public read, authenticated write)
- items bucket (public read, authenticated write)

**Edge Functions Secrets**
- RESEND_API_KEY - API key for Resend email service

**Database Extensions**
- pg_trgm (trigram similarity search)

**Realtime Publications**
- notifications table published

### 9.3 Build & Deployment

**Development**
\`\`\`bash
bun install
bun run dev
\`\`\`

**Production Build**
\`\`\`bash
bun run build
bun run preview
\`\`\`

**Deployment**
- Automatic deployment via Lovable platform
- Frontend deploys on code changes
- Edge functions deploy automatically
- Database migrations require approval

### 9.4 Domain Configuration
- Default: [project-name].lovable.app
- Custom domain support (requires paid plan)
- SSL/TLS automatic

---

## 10. DESIGN SYSTEM

### 10.1 Color Palette (HSL)

**Dark Mode**
- background: 240 10% 3.9%
- foreground: 0 0% 98%
- primary: 263.4 70% 50.4%
- primary-foreground: 0 0% 98%
- secondary: 240 3.7% 15.9%
- accent: 240 3.7% 15.9%
- muted: 240 3.7% 15.9%
- destructive: 0 62.8% 30.6%
- border: 240 3.7% 15.9%

**Light Mode**
- background: 0 0% 100%
- foreground: 240 10% 3.9%
- primary: 263.4 70% 50.4%
- primary-foreground: 0 0% 98%
- secondary: 240 4.8% 95.9%
- accent: 240 4.8% 95.9%
- muted: 240 4.8% 95.9%
- destructive: 0 84.2% 60.2%
- border: 240 5.9% 90%

**Accent Colors**
- Purple: hsl(263.4, 70%, 50.4%)
- Green: hsl(142.1, 70.6%, 45.3%)

### 10.2 Typography
- Font Family: System font stack (sans-serif)
- Heading Scales: text-4xl, text-3xl, text-2xl, text-xl, text-lg
- Body: text-base, text-sm, text-xs
- Font Weights: 300, 400, 500, 600, 700, 800, 900

### 10.3 Spacing
- Tailwind default spacing scale (0.25rem increments)
- Container max-width: 1280px
- Responsive padding: px-4 md:px-6 lg:px-8

### 10.4 Animations
- Fade in: animate-fade-in
- Scale in: animate-scale-in
- Slide up: animate-slide-up
- Hover scale: hover:scale-105
- Smooth transitions: transition-all duration-300

---

## 11. FUTURE ENHANCEMENTS (Roadmap)

### Planned Features
1. **Chat System** - Direct messaging between owners and finders
2. **Appointment Scheduling** - Schedule item return meetings
3. **Ownership Verification** - Upload proof of ownership for claims
4. **Image Auto-Blur** - Blur sensitive information in documents
5. **Advanced Analytics** - Dashboard with insights and statistics
6. **Mobile App** - Native iOS/Android applications
7. **Email Digest** - Weekly summary of matching items
8. **Location-Based Matching** - Enhanced matching with GPS data
9. **QR Code Generation** - QR codes for physical lost item posters
10. **Multi-Campus Support** - Expand to multiple university campuses

---

## 12. SUPPORT & MAINTENANCE

### Error Handling
- Global error boundaries in React
- Toast notifications for user errors
- Console logging for debug (development)
- Sentry integration (future)

### Performance Optimization
- Code splitting with React.lazy
- Image optimization with Supabase Storage
- Database query optimization with indexes
- Realtime subscription cleanup

### Monitoring
- Supabase dashboard for backend metrics
- Lovable analytics for frontend usage
- Error tracking (to be implemented)

---

## CONCLUSION

ÉduPortail is a full-featured, secure, and user-friendly lost and found management system tailored for educational institutions. Built with modern web technologies and best practices, it provides a comprehensive solution for campus item recovery.

The system leverages intelligent matching, real-time notifications, and a robust authentication system to ensure security and effectiveness. With a modular architecture and clean codebase, ÉduPortail is maintainable, scalable, and ready for future enhancements.

For technical support or feature requests, please contact the development team.

---

**Document Version**: 1.0
**Last Updated**: ${new Date().toLocaleDateString()}
**Project**: ÉduPortail
**Institution**: Chitkara University
`;

    const blob = new Blob([doc], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ÉduPortail-Complete-Documentation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
              ÉduPortail Documentation
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Complete technical documentation covering all features, architecture, and implementation details
            </p>
          </CardHeader>
          
          <Separator className="my-6" />
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">📋 What's Included</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Project Overview & Purpose</li>
                  <li>• Complete Technology Stack</li>
                  <li>• All Features & Functionality</li>
                  <li>• Database Architecture & Schema</li>
                  <li>• Component Structure</li>
                  <li>• Authentication & Security</li>
                  <li>• API Endpoints & Functions</li>
                  <li>• User Flows & Journeys</li>
                  <li>• Deployment Configuration</li>
                  <li>• Design System & Styling</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">🔧 Technical Details</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• React + TypeScript Setup</li>
                  <li>• Supabase Backend Integration</li>
                  <li>• Database Tables & RLS Policies</li>
                  <li>• Edge Functions Documentation</li>
                  <li>• Smart Matching Algorithm</li>
                  <li>• Real-time Notifications</li>
                  <li>• 2FA Implementation</li>
                  <li>• Social Sharing Integration</li>
                  <li>• Activity Timeline System</li>
                  <li>• Security Best Practices</li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Download Documentation
              </h3>
              <p className="text-sm text-muted-foreground">
                Download the complete documentation as a text file. You can convert it to PDF using any word processor 
                (Microsoft Word, Google Docs, LibreOffice) by opening the file and selecting "Save as PDF" or "Export to PDF".
              </p>
              <Button 
                onClick={downloadDocumentation}
                size="lg"
                className="w-full md:w-auto group"
              >
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Download Full Documentation
              </Button>
              <p className="text-xs text-muted-foreground">
                Format: Plain Text (.txt) | Size: ~25 KB | Sections: 12
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📄 How to Convert to PDF</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Option 1: Microsoft Word</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Open the downloaded .txt file in Microsoft Word</li>
                  <li>Go to File → Save As</li>
                  <li>Choose PDF as the file format</li>
                  <li>Click Save</li>
                </ol>
                
                <p className="pt-4"><strong>Option 2: Google Docs</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Upload the .txt file to Google Drive</li>
                  <li>Open with Google Docs</li>
                  <li>Go to File → Download → PDF Document (.pdf)</li>
                </ol>

                <p className="pt-4"><strong>Option 3: Online Converter</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Visit any TXT to PDF converter website</li>
                  <li>Upload the downloaded file</li>
                  <li>Convert and download as PDF</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
