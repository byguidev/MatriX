import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

function SidebarDesktop() {
    const location = useLocation();

    // controla expansao da sidebar e comportamento especifico no mobile
    const [isExpanded, setIsExpanded] = useState(() => {
        const saved = localStorage.getItem("expanded");
        if (saved !== null) {
            return JSON.parse(saved);
        }
        localStorage.setItem("expanded", JSON.stringify(true));
        return true;
    });
    const [showText, setShowText] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // define limites de largura para transicao visual
    const MAX_WIDTH = 250
    const MIN_WIDTH = 60
const COLLAPSE_IDS = ["collapse-students", "collapse-courses"]
    const mobileWidth = "min(85vw, 320px)"

    // concentra estilos dinamicos usados no desktop e no mobile
    const navbarStyles = {
        mobileNavbar: {
            zIndex: 1060
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            zIndex: 1050,
            marginTop: '60px'
        },
        sidebar: isMobile ? {
            position: 'fixed',
            top: '60px',
            left: 0,
            width: mobileWidth,
            minWidth: mobileWidth,
            // usa dvh para evitar corte da sidebar por barras do navegador mobile
            height: 'calc(100dvh - 60px)',
            transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            zIndex: 1051,
        } : {
            position: 'relative',
            width: isExpanded ? `${MAX_WIDTH}px` : `${MIN_WIDTH}px`,
            minWidth: isExpanded ? `${MAX_WIDTH}px` : `${MIN_WIDTH}px`,
            transition: 'all 0.3s ease'
        }
    }

    // calcula classes de layout com base no estado atual do menu
    const isVisuallyExpanded = isExpanded || isMobile;
    
    const baseNavItemClass = "nav-item w-100"
    const collapsedNavItemClass = `${baseNavItemClass} d-flex justify-content-center`
    const expandedNavItemClass = isVisuallyExpanded ? baseNavItemClass : collapsedNavItemClass
    
    const baseNavLinkClass = "nav-link w-auto"
    const expandedNavLinkClass = `${baseNavLinkClass} ms-4`
    const collapsedNavLinkClass = `${baseNavLinkClass} text-center`
    const navLinkClass = isVisuallyExpanded ? expandedNavLinkClass : collapsedNavLinkClass

    // destaca menus ativos conforme rota atual
    const getGroupClass = (paths) => {
        const isActive = paths.some(p => location.pathname.startsWith(p));
        return `${navLinkClass} ${isActive ? "text-muted fw-bold" : ""}`;
    };

    const getLinkClass = (path) => {
        const isActive = location.pathname.startsWith(path);
        // aplica recuo nos links internos para reforcar hierarquia visual
        return `nav-link w-100 ms-3 ${isActive ? "text-muted fw-bold" : ""}`;
    };

    // fecha submenus ao recolher para evitar inconsistencias de estado visual
    const closeAllSubmenus = () => {
        COLLAPSE_IDS.forEach((id) => {
            const submenu = document.getElementById(id)
            if (submenu) {
                submenu.classList.remove("show")
            }

            const trigger = document.querySelector(`[data-bs-target="#${id}"]`)
            if (trigger) {
                trigger.setAttribute("aria-expanded", "false")
            }
        })
    }

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileOpen(prev => !prev)
            return
        }

        if (isExpanded) {
            closeAllSubmenus()
            setIsExpanded(false)
            localStorage.setItem("expanded", JSON.stringify(false))
            setShowText(false)
            return
        }
        
        setIsExpanded(true)
        localStorage.setItem("expanded", JSON.stringify(true))
    }

    const handleTransition = event => {
        if (event.propertyName !== "width") return

        const currentWidth = event.currentTarget.getBoundingClientRect().width
        setShowText(currentWidth >= MAX_WIDTH)
    }

    const onClickCollapse = () => {
        if (!isExpanded) {
            setIsExpanded(true)
            localStorage.setItem("expanded", JSON.stringify(true))
            setShowText(false)
        }
    }

    // alterna comportamento do menu quando a tela cruza o breakpoint mobile
    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767.98px)")

        const handleMediaChange = event => {
            setIsMobile(event.matches)

            if (event.matches) {
                setIsMobileOpen(false)
                setShowText(true)
            } else {
                setIsMobileOpen(false)
                
                // no desktop, restaura preferencia de expansao salva no navegador
                const saved = localStorage.getItem("expanded")
                const isExp = saved !== null ? JSON.parse(saved) : true
                
                setIsExpanded(isExp)
                setShowText(isExp) // exibe textos apenas quando a sidebar esta expandida
            }
        }

        handleMediaChange(mediaQuery)

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleMediaChange)
            return () => mediaQuery.removeEventListener("change", handleMediaChange)
        }

        mediaQuery.addListener(handleMediaChange)
        return () => mediaQuery.removeListener(handleMediaChange)
    }, [])

    // valores derivados para simplificar a renderizacao do jsx
    const sidebarOpen = isMobile ? isMobileOpen : true
    const arrowIcon = isExpanded ? "bi-arrow-left" : "bi-arrow-right"
    const iconVisibility = showText ? "d-inline" : "d-none"

    return (
        <>
            {/* navbar superior exibida apenas no mobile */}
            {isMobile && (
                <nav
                    className="navbar navbar-light bg-light border-bottom d-md-none position-fixed top-0 start-0 w-100"
                    style={navbarStyles.mobileNavbar}
                >
                    <div className="container-fluid d-flex align-items-center justify-content-between">
                        <button
                            className="btn btn-light border"
                            onClick={toggleSidebar}
                            aria-label="Abrir menu lateral"
                        >
                            <i className="bi bi-list fs-5"></i>
                        </button>
                        <a href="#" className="navbar-brand text-muted mx-auto d-flex align-items-center mb-0 text-decoration-none">
                            <i className="bi bi-columns-gap h2 my-0 me-2"></i>
                            <span className="h2 my-0 fw-bold">MatriX</span>
                        </a>
                        <div style={{ width: '42px' }}></div>
                    </div>
                </nav>
            )}

            {/* overlay fecha o menu ao clicar fora da sidebar */}
            {isMobile && sidebarOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
                    style={navbarStyles.overlay}
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* sidebar principal com navegacao do painel */}
            <nav
                // evita conflito de altura no mobile com a regra h-100 do bootstrap
                className={`navbar flex-shrink-0 ${!isMobile ? 'h-100' : ''} bg-light border-end d-md-block p-0 flex-column`}
                style={navbarStyles.sidebar}
                onTransitionEnd={handleTransition}
            >
                {/* flex-grow ja ocupa o espaco restante sem forcar altura fixa */}
                <ul className="navbar-nav d-flex flex-column w-100 h-100">
                    {/* logo fica no topo apenas na versao desktop */}
                    {!isMobile && (
                        <li className={isExpanded ? baseNavItemClass : `${baseNavItemClass} d-flex flex-column align-items-center`}>
                            <button
                                className="btn w-100 py-0 d-none d-md-block"
                                onClick={toggleSidebar}
                            >
                                <i className={`bi ${arrowIcon} fs-2`}></i>
                            </button>
                            <a
                                href="#"
                                className={isExpanded
                                    ? "nav-link ps-4 border-top w-100 d-flex align-items-center py-2"
                                    : "nav-link border-top text-center w-100 d-flex align-items-center justify-content-center"
                                }
                            >
                                <i className={isExpanded
                                    ? "bi bi-columns-gap me-2 h1 my-0"
                                    : "bi bi-columns-gap h1 my-0"
                                }></i>
                                <span className={`${iconVisibility} h1 my-0`}>MatriX</span>
                            </a>
                        </li>
                    )}

                    {/* item de visao geral */}
                    <li className={expandedNavItemClass}>
                        <a href="#" className={navLinkClass}>
                            <i className={isVisuallyExpanded
                                ? "bi bi-bar-chart-line-fill me-2"
                                : "bi bi-bar-chart-line-fill"
                            }></i>
                            <span className={iconVisibility}>Visão Geral</span>
                        </a>
                    </li>

                    {/* grupo de rotas de alunos */}
                    <li className={expandedNavItemClass}>
                        <a
                            href="#"
                            className={getGroupClass(["/manage-students", "/student-profile"])}
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse-students"
                            onClick={onClickCollapse}
                        >
                            <i className={isVisuallyExpanded
                                ? "bi bi-file-person-fill me-2"
                                : "bi bi-file-person-fill"
                            }></i>
                            <span className={iconVisibility}>Alunos</span>
                        </a>
                        <ul className="navbar-nav collapse w-100 ps-4" id="collapse-students">
                            <li className="nav-item border-bottom w-100">
                                <Link to="/manage-students" className={getLinkClass("/manage-students")}>
                                    <i className={`bi bi-person-lines-fill ${showText ? "me-2" : ""}`}></i>
                                    <span className={iconVisibility}>Gerenciar Alunos</span>
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* grupo de rotas de cursos e turmas */}
                    <li className={expandedNavItemClass}>
                        <a
                            href="#"
                            className={getGroupClass(["/manage-courses", "/manage-classes"])}
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse-courses"
                            onClick={onClickCollapse}
                        >
                            <i className={isVisuallyExpanded
                                ? "bi bi-book-fill me-2"
                                : "bi bi-book-fill"
                            }></i>
                            <span className={iconVisibility}>Ensino</span>
                        </a>
                        <ul className="navbar-nav collapse w-100 ps-4" id="collapse-courses">
                            <li className="nav-item border-bottom w-100">
                                <Link to="/manage-courses" className={getLinkClass("/manage-courses")}>
                                    <i className={`bi bi-journal-text ${showText ? "me-2" : ""}`}></i>
                                    <span className={iconVisibility}>Gerenciar Cursos</span>
                                </Link>
                            </li>
                            <li className="nav-item border-bottom w-100">
                                <Link to="/manage-classes" className={getLinkClass("/manage-classes")}>
                                    <i className={`bi bi-collection ${showText ? "me-2" : ""}`}></i>
                                    <span className={iconVisibility}>Gerenciar Turmas</span>
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* configuracoes fica no rodape para manter acesso rapido */}
                    <li className={`${expandedNavItemClass} mt-auto border-top`}>
                        <Link to="/configuracoes" className={getGroupClass(["/configuracoes"])}>
                            <i className={isVisuallyExpanded
                                ? "bi bi-gear me-2"
                                : "bi bi-gear"
                            }></i>
                            <span className={iconVisibility}>Configurações</span>
                        </Link>
                    </li>

                    {/* atalho para perfil do usuario */}
                    <li className={expandedNavItemClass}>
                        <Link to="/perfil" className={getGroupClass(["/perfil"])}>
                            <i className={isVisuallyExpanded
                                ? "bi bi-person-circle me-2"
                                : "bi bi-person-circle"
                            }></i>
                            <span className={iconVisibility}>Perfil</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default SidebarDesktop
