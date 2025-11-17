import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  role: string;
  progress: {
    completedModules: number[];
    examenCompleted: boolean;
    examenPassed: boolean;
    examenScore: number;
  };
  createdAt: Date;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('name');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersData: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          name: data.name || 'Sin nombre',
          role: data.role || 'Estudiante',
          progress: data.progress || {
            completedModules: [],
            examenCompleted: false,
            examenPassed: false,
            examenScore: 0
          },
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortUsers = (usersToSort: UserData[]) => {
    return [...usersToSort].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'progress') {
        return b.progress.completedModules.length - a.progress.completedModules.length;
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  };

  const calculateProgress = (completedModules: number[]) => {
    const totalModules = 16;
    return Math.round((completedModules.length / totalModules) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const sortedUsers = sortUsers(users);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
            <p className="text-gray-600">Total de usuarios: {users.length}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="name">Ordenar por nombre</option>
            <option value="progress">Ordenar por progreso</option>
            <option value="date">Ordenar por fecha</option>
          </select>
          
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-100 text-left">
              <th className="p-3 font-semibold text-purple-900">Usuario</th>
              <th className="p-3 font-semibold text-purple-900">Rol</th>
              <th className="p-3 font-semibold text-purple-900">Módulos</th>
              <th className="p-3 font-semibold text-purple-900">Progreso</th>
              <th className="p-3 font-semibold text-purple-900">Examen</th>
              <th className="p-3 font-semibold text-purple-900">Puntuación</th>
              <th className="p-3 font-semibold text-purple-900">Fecha registro</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => {
              const progress = calculateProgress(user.progress.completedModules);
              
              return (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-gray-50 transition ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-medium text-gray-900">
                      {user.progress.completedModules.length}/16
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12">
                        {progress}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {user.progress.examenCompleted ? (
                      user.progress.examenPassed ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Aprobado</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">No aprobado</span>
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-gray-500">Pendiente</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {user.progress.examenCompleted ? (
                      <span className="font-medium text-gray-900">
                        {user.progress.examenScore}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {user.createdAt.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay usuarios registrados aún</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Progreso Promedio</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {users.length > 0
              ? Math.round(
                  users.reduce(
                    (acc, user) => acc + calculateProgress(user.progress.completedModules),
                    0
                  ) / users.length
                )
              : 0}%
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Exámenes Aprobados</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.progress.examenPassed).length}/{users.length}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Usuarios Activos</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.progress.completedModules.length > 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
