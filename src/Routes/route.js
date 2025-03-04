import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../Components/GlobalComponents/Layout";
import Home from "../Pages/Home/home";
import ArchivedNotes from "../Pages/ArchivedNotes/archivednotes";

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/archived-notes" element={<ArchivedNotes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;
