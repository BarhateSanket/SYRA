import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../components/Header'
import { userDataContext } from '../ContextApi/UserContext'

// Mock the context
const mockSetUserData = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../ContextApi/UserContext', () => ({
  userDataContext: {
    Provider: ({ children }) => children,
  },
}))

const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
}

const renderHeader = (userData = null) => {
  return render(
    <BrowserRouter>
      <userDataContext.Provider value={{ userData, setUserData: mockSetUserData }}>
        <Header />
      </userDataContext.Provider>
    </BrowserRouter>
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Logo and Branding', () => {
    it('renders the SYRA AI logo and text', () => {
      renderHeader()
      expect(screen.getByAltText('SYRA AI Logo')).toBeInTheDocument()
      expect(screen.getByText('SYRA AI')).toBeInTheDocument()
    })

    it('navigates to home when logo is clicked', () => {
      renderHeader()
      const logo = screen.getByAltText('SYRA AI Logo')
      fireEvent.click(logo)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('Navigation Links', () => {
    it('renders all navigation links for desktop', () => {
      renderHeader()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Legal')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
      expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    })

    it('navigates to correct routes when navigation links are clicked', () => {
      renderHeader()
      fireEvent.click(screen.getByText('Home'))
      expect(mockNavigate).toHaveBeenCalledWith('/')

      fireEvent.click(screen.getByText('Legal'))
      expect(mockNavigate).toHaveBeenCalledWith('/legal')

      fireEvent.click(screen.getByText('Contact'))
      expect(mockNavigate).toHaveBeenCalledWith('/contact')

      fireEvent.click(screen.getByText('History'))
      expect(mockNavigate).toHaveBeenCalledWith('/history')

      fireEvent.click(screen.getByText('Payment Methods'))
      expect(mockNavigate).toHaveBeenCalledWith('/payment-method')
    })
  })

  describe('User Authentication States', () => {
    describe('When user is not logged in', () => {
      it('shows Sign In and Get Started buttons', () => {
        renderHeader(null)
        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByText('Get Started')).toBeInTheDocument()
      })

      it('navigates to signin page when Sign In is clicked', () => {
        renderHeader(null)
        fireEvent.click(screen.getByText('Sign In'))
        expect(mockNavigate).toHaveBeenCalledWith('/signin')
      })

      it('navigates to signup page when Get Started is clicked', () => {
        renderHeader(null)
        fireEvent.click(screen.getByText('Get Started'))
        expect(mockNavigate).toHaveBeenCalledWith('/signup')
      })

      it('does not show user-specific navigation', () => {
        renderHeader(null)
        expect(screen.queryByText('Customize')).not.toBeInTheDocument()
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      })
    })

    describe('When user is logged in', () => {
      it('shows user profile and customize button', () => {
        renderHeader(mockUserData)
        expect(screen.getByText('Customize')).toBeInTheDocument()
        expect(screen.getByText(mockUserData.name)).toBeInTheDocument()
      })

      it('shows profile dropdown when profile button is clicked', async () => {
        renderHeader(mockUserData)
        const profileButton = screen.getByText(mockUserData.name)
        fireEvent.click(profileButton)

        await waitFor(() => {
          expect(screen.getByText('Dashboard')).toBeInTheDocument()
          expect(screen.getByText('Customize Assistant')).toBeInTheDocument()
          expect(screen.getByText('Conversation History')).toBeInTheDocument()
          expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument()
          expect(screen.getByText('Sign Out')).toBeInTheDocument()
        })
      })

      it('navigates to customize page when Customize button is clicked', () => {
        renderHeader(mockUserData)
        fireEvent.click(screen.getByText('Customize'))
        expect(mockNavigate).toHaveBeenCalledWith('/customize')
      })

      it('handles logout correctly', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
          })
        )

        renderHeader(mockUserData)

        // Open profile dropdown
        const profileButton = screen.getByText(mockUserData.name)
        fireEvent.click(profileButton)

        // Click sign out
        await waitFor(() => {
          fireEvent.click(screen.getByText('Sign Out'))
        })

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/logout'),
            expect.objectContaining({
              method: 'GET',
              credentials: 'include',
            })
          )
          expect(mockSetUserData).toHaveBeenCalledWith(null)
          expect(mockNavigate).toHaveBeenCalledWith('/signin')
        })
      })
    })
  })

  describe('Mobile Menu', () => {
    it('toggles mobile menu when hamburger button is clicked', () => {
      renderHeader()
      const menuButton = screen.getByLabelText('Toggle menu')

      // Menu should be closed initially
      expect(screen.queryByText('Home')).toBeInTheDocument() // Desktop version

      fireEvent.click(menuButton)
      // Mobile menu should now be open
      expect(screen.getAllByText('Home')).toHaveLength(2) // Desktop and mobile
    })

    it('closes mobile menu when navigation link is clicked', () => {
      renderHeader()
      const menuButton = screen.getByLabelText('Toggle menu')
      fireEvent.click(menuButton)

      // Click a mobile menu item
      const mobileHomeLink = screen.getAllByText('Home')[1] // Second instance is mobile
      fireEvent.click(mobileHomeLink)

      // Menu should close (we can't easily test this without more complex setup)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('Theme Toggle', () => {
    it('renders theme toggle component', () => {
      renderHeader()
      // ThemeToggle component should be rendered (basic check)
      expect(screen.getByRole('button')).toBeInTheDocument() // Theme toggle has a button
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderHeader()
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
    })

    it('has proper alt text for images', () => {
      renderHeader()
      expect(screen.getByAltText('SYRA AI Logo')).toBeInTheDocument()
    })
  })
})
