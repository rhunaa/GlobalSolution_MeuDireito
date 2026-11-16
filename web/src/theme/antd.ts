import { theme as antdTema, type ThemeConfig } from 'antd'

/**
 * Tokens do Ant Design – mesmos valores de src/theme/tokens.css e de
 * docs/THEME.md. Ao mudar uma cor, mude nos dois lugares.
 */
const base = {
  fontFamily: '"Montserrat", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: 16,
  borderRadius: 6,
  borderRadiusLG: 12,
  controlHeight: 44, // alvos de toque confortáveis (mínimo recomendado: 44px)
  lineWidth: 1,
  wireframe: false,
}

export function temaAntd(modo: 'light' | 'dark', reduzirMovimento: boolean): ThemeConfig {
  const claro = modo === 'light'
  return {
    algorithm: claro ? antdTema.defaultAlgorithm : antdTema.darkAlgorithm,
    token: {
      ...base,
      motion: !reduzirMovimento,
      colorPrimary: claro ? '#1b2a4a' : '#9db4e8',
      colorTextLightSolid: claro ? '#ffffff' : '#0f1a30', // texto sobre o botão principal
      colorInfo: claro ? '#1b2a4a' : '#9db4e8',
      colorSuccess: claro ? '#1e6b3a' : '#7fd69b',
      colorWarning: claro ? '#7a4a00' : '#f5c065',
      colorError: claro ? '#a3201b' : '#ff9b94',
      colorLink: claro ? '#1b2a4a' : '#9db4e8',
      colorBgBase: claro ? '#f2f4fb' : '#0e171b',
      colorBgContainer: claro ? '#ffffff' : '#16232a',
      colorBgElevated: claro ? '#ffffff' : '#1a2930',
      colorTextBase: claro ? '#1a2328' : '#ecf1f3',
      colorTextSecondary: claro ? '#4f5d63' : '#a7b5bb',
      colorTextDescription: claro ? '#4f5d63' : '#a7b5bb',
      colorTextPlaceholder: claro ? '#5f6b70' : '#93a3aa',
      colorBorder: claro ? '#7c8a90' : '#6e838c', // bordas de campos: contraste ≥ 3:1
      colorBorderSecondary: claro ? '#e1e6f2' : '#33454e',
      // Fundos dos itens de listas e menus (hover, selecionado, selecionado + hover): explícitos
      controlItemBgHover: claro ? '#e3eafb' : '#1c2a4d',
      controlItemBgActive: claro ? '#dbe4f9' : '#26386b',
      controlItemBgActiveHover: claro ? '#cfdcf6' : '#2f447f',
      // Fundos de aviso explícitos (o Ant Design os deriva do azul-marinho e saem turvos)
      colorInfoBg: claro ? '#e3eafb' : '#1c2a4d',
      colorInfoBorder: claro ? '#c5d2f3' : '#33457a',
      colorSuccessBg: claro ? '#e2f2e6' : '#173823',
      colorSuccessBorder: claro ? '#b9dcc3' : '#2a5c3a',
      colorWarningBg: claro ? '#fcefd6' : '#3a2e14',
      colorWarningBorder: claro ? '#f1d9a6' : '#5c4a1f',
      colorErrorBg: claro ? '#f9e0de' : '#431d1b',
      colorErrorBorder: claro ? '#efb9b5' : '#7a3a36',
    },
    components: {
      Button: { fontWeight: 600, paddingInline: 20 },
      Card: { headerFontSize: 20 },
      // Itens do menu de seleção: fundos explícitos (derivados do azul-marinho saem acinzentados)
      Select: claro
        ? { optionActiveBg: '#e3eafb', optionSelectedBg: '#d6e0f8', optionSelectedColor: '#1a2328', multipleItemBg: '#e3eafb' }
        : { optionActiveBg: '#1c2a4d', optionSelectedBg: '#26386b', optionSelectedColor: '#ecf1f3' },
    },
  }
}
