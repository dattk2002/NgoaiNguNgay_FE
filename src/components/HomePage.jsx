function HomePage({ user }) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mt-4 max-w-3xl mx-auto">
          <h2 className="text-blue-600 text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
          <p>You are now logged in to your Facebook account.</p>
        </div>
      </div>
    );
  }
  
  export default HomePage;