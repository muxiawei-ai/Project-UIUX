import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '../components/CopyButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EffectLab } from './EffectLab';

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText }
  });
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

function mockRect(element: Element, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    left: rect.left ?? 0,
    top: rect.top ?? 0,
    right: rect.right ?? 100,
    bottom: rect.bottom ?? 100,
    width: rect.width ?? 100,
    height: rect.height ?? 100,
    toJSON: () => ({})
  } as DOMRect);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: undefined
  });
});

describe('EffectLab', () => {
  it('renders the curated pack and selects an effect', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    expect(screen.getByRole('heading', { name: /React Bits Effects/i })).toBeInTheDocument();
    expect(screen.getByText('15 effects')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UI' }));
    await user.click(screen.getByRole('button', { name: /Border Glow/i }));

    expect(screen.getByRole('heading', { name: 'Border Glow' })).toBeInTheDocument();
    expect(screen.getByText(/cursor-directed mesh glow/i)).toBeInTheDocument();
  });

  it('switches the preview to the first visible search result', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    expect(screen.getByRole('heading', { name: 'BlurText' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search effects/i), 'dock');

    expect(screen.getByRole('heading', { name: 'Dock' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dock/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aurora/i })).not.toBeInTheDocument();
  });

  it('marks the active effect button as selected', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    const blurTextButton = screen.getByRole('button', { name: /BlurText/i });
    expect(blurTextButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Dock/i }));

    expect(screen.getByRole('button', { name: /BlurText/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Dock/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows a no-results state when the search has no matches', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    await user.type(screen.getByPlaceholderText(/search effects/i), 'zzzz');

    expect(screen.getByText(/no effects match this search/i)).toBeInTheDocument();
    expect(screen.getByText(/try a different keyword or category/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No effects found' })).toBeInTheDocument();
  });

  it('remounts the active preview when reset is clicked', async () => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    render(<EffectLab />);

    fireEvent.click(screen.getByRole('button', { name: /CountUp/i }));
    expect(screen.getByText('0')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(240);
    });

    expect(screen.queryByText('0')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset preview/i }));

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders CountUp final value immediately when reduced motion is preferred', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(<EffectLab />);

    await user.click(screen.getByRole('button', { name: /CountUp/i }));

    expect(await screen.findByText('12,840')).toBeInTheDocument();
  });

  it('moves Magnet and SpotlightCard from pointer position when motion is allowed', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(<EffectLab />);

    await user.click(screen.getByRole('button', { name: 'Interaction' }));
    await user.click(screen.getByRole('button', { name: /Magnet/i }));

    const magnet = screen.getByRole('button', { name: 'Pull me' });
    mockRect(magnet, { left: 0, top: 0, width: 100, height: 50 });
    fireEvent(magnet, new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 50 }));

    expect(magnet).toHaveStyle('--magnet-x: 9.0px');
    expect(magnet).toHaveStyle('--magnet-y: 7.0px');

    await user.click(screen.getByRole('button', { name: 'UI' }));
    await user.click(screen.getByRole('button', { name: /SpotlightCard/i }));

    const spotlight = screen.getByText('Pointer-aware feature card').closest('article');
    expect(spotlight).not.toBeNull();
    mockRect(spotlight as Element, { left: 0, top: 0, width: 200, height: 100 });
    fireEvent(spotlight as Element, new MouseEvent('pointermove', { bubbles: true, clientX: 40, clientY: 50 }));

    expect(spotlight).toHaveStyle('--x: 20.0%');
    expect(spotlight).toHaveStyle('--y: 50.0%');
  });

  it('renders Border Glow as a cursor-directed edge glow', async () => {
    const user = userEvent.setup();
    const { container } = render(<EffectLab />);

    await user.click(screen.getByRole('button', { name: 'UI' }));
    await user.click(screen.getByRole('button', { name: /Border Glow/i }));

    const card = container.querySelector('.border-glow-card');
    expect(card).not.toBeNull();
    expect(container.querySelector('.edge-light')).not.toBeNull();
    expect(container.querySelector('.border-glow-inner')).not.toBeNull();
    expect(screen.getByText(/Hover Near the Edges/i)).toBeInTheDocument();

    mockRect(card as Element, { left: 0, top: 0, width: 200, height: 100 });
    fireEvent(card as Element, new MouseEvent('pointermove', { bubbles: true, clientX: 200, clientY: 50 }));

    expect(card).toHaveClass('is-glow-active');
    expect(card).toHaveStyle('--edge-proximity: 100.000');
    expect(card).toHaveStyle('--cursor-angle: 90.000deg');
  });
});

describe('CopyButton', () => {
  it('shows success only after a successful copy', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    render(<CopyButton value="const demo = true;" />);

    const button = screen.getByRole('button', { name: /copy usage snippet/i });
    await user.click(button);

    expect(writeText).toHaveBeenCalledWith('const demo = true;');
    expect(screen.getByRole('button', { name: /copied usage snippet/i })).toBeInTheDocument();
  });

  it('does not report success when copy fails', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    mockClipboard(writeText);

    render(<CopyButton value="const demo = true;" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy usage snippet/i }));
    });

    expect(writeText).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /copy failed/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copied usage snippet/i })).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByRole('button', { name: /copy usage snippet/i })).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  function ThrowingPreview({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
      throw new Error('Preview exploded');
    }

    return <div>Preview ready</div>;
  }

  it('renders a fallback and resets when the reset key changes', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey="broken">
        <ThrowingPreview shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/could not render/i);

    rerender(
      <ErrorBoundary resetKey="recovered">
        <ThrowingPreview shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Preview ready')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
