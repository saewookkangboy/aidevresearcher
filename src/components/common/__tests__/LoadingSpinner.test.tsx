import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.w-12.h-12');
    expect(spinner).toBeInTheDocument();
  });

  it('applies small size correctly', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.w-4.h-4');
    expect(spinner).toBeInTheDocument();
  });
});

