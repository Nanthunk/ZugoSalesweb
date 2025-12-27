import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
