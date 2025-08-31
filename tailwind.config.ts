import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-900': 'var(--color-dark-900)',
        'dark-700': 'var(--color-dark-700)',
        'dark-500': 'var(--color-dark-500)',
        'light-100': 'var(--color-light-100)',
        'light-200': 'var(--color-light-200)',
        'light-300': 'var(--color-light-300)',
        'light-400': 'var(--color-light-400)',
        'green': 'var(--color-green)',
        'red': 'var(--color-red)',
        'orange': 'var(--color-orange)',
      },
      fontSize: {
        'heading-1': ['var(--text-heading-1)', {
          lineHeight: 'var(--text-heading-1--line-height)',
          fontWeight: 'var(--text-heading-1--font-weight)',
        }],
        'heading-2': ['var(--text-heading-2)', {
          lineHeight: 'var(--text-heading-2--line-height)',
          fontWeight: 'var(--text-heading-2--font-weight)',
        }],
        'heading-3': ['var(--text-heading-3)', {
          lineHeight: 'var(--text-heading-3--line-height)',
          fontWeight: 'var(--text-heading-3--font-weight)',
        }],
        'lead': ['var(--text-lead)', {
          lineHeight: 'var(--text-lead--line-height)',
          fontWeight: 'var(--text-lead--font-weight)',
        }],
        'body': ['var(--text-body)', {
          lineHeight: 'var(--text-body--line-height)',
          fontWeight: 'var(--text-body--font-weight)',
        }],
        'body-medium': ['var(--text-body-medium)', {
          lineHeight: 'var(--text-body-medium--line-height)',
          fontWeight: 'var(--text-body-medium--font-weight)',
        }],
        'caption': ['var(--text-caption)', {
          lineHeight: 'var(--text-caption--line-height)',
          fontWeight: 'var(--text-caption--font-weight)',
        }],
        'footnote': ['var(--text-footnote)', {
          lineHeight: 'var(--text-footnote--line-height)',
          fontWeight: 'var(--text-footnote--font-weight)',
        }],
      },
      fontFamily: {
        jost: ['var(--font-jost)'],
      },
    },
  },
  plugins: [],
}
export default config
