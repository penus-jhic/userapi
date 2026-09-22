import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { USER_ROLES_ARRAY, GENDER_ARRAY } from '../constants/roles.js';

export class User extends Model {
  // Method untuk memverifikasi password
  async comparePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  // Override toJSON agar field sensitif (password) tidak pernah terekspos
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'users_username_unique',
        msg: 'Username sudah digunakan'
      },
      validate: {
        notEmpty: { msg: 'Username tidak boleh kosong' },
        len: { args: [3, 50], msg: 'Username harus memiliki panjang 3-50 karakter' }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password tidak boleh kosong' }
      }
    },
    nama_lengkap: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama lengkap tidak boleh kosong' }
      }
    },
    nomor_induk: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'users_nomor_induk_unique',
        msg: 'Nomor induk (NIS/NIP/NUPTK) sudah terdaftar'
      },
      comment: 'Nomor Induk Siswa (NIS/NISN) atau Pegawai (NIP/NUPTK)'
    },
    role: {
      type: DataTypes.ENUM(...USER_ROLES_ARRAY),
      allowNull: false,
      validate: {
        isIn: {
          args: [USER_ROLES_ARRAY],
          msg: `Role harus salah satu dari: ${USER_ROLES_ARRAY.join(', ')}`
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: {
        name: 'users_email_unique',
        msg: 'Email sudah terdaftar'
      },
      validate: {
        isEmail: { msg: 'Format email tidak valid' }
      }
    },
    no_hp: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    jenis_kelamin: {
      type: DataTypes.ENUM(...GENDER_ARRAY),
      allowNull: true,
      validate: {
        isIn: {
          args: [GENDER_ARRAY],
          msg: `Jenis kelamin harus salah satu dari: ${GENDER_ARRAY.join(', ')}`
        }
      }
    },
    status_aktif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    foto_profil: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
