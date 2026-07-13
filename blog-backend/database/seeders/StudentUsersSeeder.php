<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class StudentUsersSeeder extends Seeder
{
    protected array $students = [
        ['name' => 'Mahbubul Alam',       'roll' => '2207002'],
        ['name' => 'Rafsan Jani',         'roll' => '2207003'],
        ['name' => 'Shahriar Prottoy',    'roll' => '2207005'],
        ['name' => 'Rafsan Riasat',       'roll' => '2207006'],
        ['name' => 'Fahim Hossen',        'roll' => '2207007'],
        ['name' => 'Mehedi Nibir',        'roll' => '2207012'],
        ['name' => 'Redoanul Karim',      'roll' => '2207014'],
        ['name' => 'Alif Al Ahad',        'roll' => '2207016'],
        ['name' => 'Sazzath Rafee',       'roll' => '2207019'],
        ['name' => 'Shah Makhdum Sharif', 'roll' => '2207089'],
        ['name' => 'Rahi Sadat Ruhan',    'roll' => '2207088'],
        ['name' => 'Lionel Messi',        'roll' => '2207122'],
        ['name' => 'Neymar Junior',       'roll' => '2207123'],
        ['name' => 'Cristiano Ronaldo',   'roll' => '2207124'],
    ];

    public function run(): void
    {
        foreach ($this->students as $s) {
            $firstName = strtolower(explode(' ', $s['name'])[0]);
            $lastThree = substr($s['roll'], -3);
            $email = "{$firstName}{$lastThree}@gmail.com";
            $password = "{$firstName}{$s['roll']}";
            $age = rand(20, 25);

            User::create([
                'name'     => $s['name'],
                'email'    => $email,
                'password' => $password,
                'status'   => 'active',
                'is_super_user' => false,
                'age'      => $age,
            ]);
        }
    }
}
