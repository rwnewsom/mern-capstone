import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../components/Toast';

describe('Toast Component', () => {
  it('renders success toast with correct message', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Success!" type="success" onClose={mockOnClose} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('toast-success');
  });

  it('renders error toast with correct styling', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Error occurred" type="error" onClose={mockOnClose} />);

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('toast-error');
  });

  it('renders info toast with correct styling', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Info message" type="info" onClose={mockOnClose} />);

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('toast-info');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<Toast message="Click me" type="success" onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close notification');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('auto-dismisses after default duration', async () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Auto dismiss" type="success" onClose={mockOnClose} duration={100} />);

    await waitFor(() => expect(mockOnClose).toHaveBeenCalled(), { timeout: 200 });
  });

  it('displays success icon for success type', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Success" type="success" onClose={mockOnClose} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('displays error icon for error type', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Error" type="error" onClose={mockOnClose} />);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('displays info icon for info type', () => {
    const mockOnClose = vi.fn();
    render(<Toast message="Info" type="info" onClose={mockOnClose} />);

    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });
});
