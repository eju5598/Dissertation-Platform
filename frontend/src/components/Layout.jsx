import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="page-container">
        {children}
      </div>
    </>
  );
}

export default Layout;
