/**
 * @nasneh/ui - Shared UI Components
 * 
 * The single source of truth for all Nasneh UI components.
 * Import from '@nasneh/ui' in all apps.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * Version: 1.0.0
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl/full (UI Law #2)
 * - ONLY mono colors (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */

// =============================================================================
// Core Components (S4-01)
// =============================================================================

// Button - Primary interactive element
export { Button } from './components/button';
export type { ButtonProps } from './components/button';

// Input - Text entry field
export { Input } from './components/input';
export type { InputProps } from './components/input';

// Card - Content container
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from './components/card';

// Badge - Status indicators
export { Badge } from './components/badge';
export type { BadgeProps } from './components/badge';

// Skeleton - Loading placeholders
export { Skeleton } from './components/skeleton';
export type { SkeletonProps } from './components/skeleton';

// Dialog - Modal overlay
export { Dialog } from './components/dialog';
export type { DialogProps } from './components/dialog';

// =============================================================================
// Additional Components (S4-01b)
// =============================================================================

// Avatar - User/vendor photos with fallback
export { Avatar } from './components/avatar';
export type { AvatarProps } from './components/avatar';

// SegmentedControl - 2-6 option selection
export { SegmentedControl } from './components/segmented-control';
export type { SegmentedControlProps, SegmentedControlOption } from './components/segmented-control';

// Tabs - Page navigation
export { Tabs } from './components/tabs';
export type { TabsProps, TabItem } from './components/tabs';

// Toast - Notifications
export { Toast, toast } from './components/toast';
export type { ToastProps } from './components/toast';

// Select - Dropdown for 7+ options
export { Select } from './components/select';
export type { SelectProps, SelectOption } from './components/select';

// Table - Data lists
export { Table } from './components/table';
export type { TableProps, TableColumn } from './components/table';

// =============================================================================
// Logo Component (Pre-existing)
// =============================================================================

export { Logo } from './components/logo';
export type { LogoProps } from './components/logo';

// =============================================================================
// Assets
// =============================================================================

export { LOGO_PATHS } from './assets/logo';
export type { LogoVariant } from './assets/logo';
