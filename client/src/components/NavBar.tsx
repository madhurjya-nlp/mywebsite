export function NavBar() {
  return (
    <header className="site-nav" role="banner">
      <a className="site-nav__brand" href="#home">
        MS
      </a>
      <nav className="site-nav__links" aria-label="Primary">
        <a href="#home">Home</a>
        <a href="#work">Work</a>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}
