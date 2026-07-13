<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class MoreUsersSeeder extends Seeder
{
    protected array $activeStudents = [
        ['name' => 'Adib Raian',       'roll' => '2207020'],
        ['name' => 'Sazzad Ahmed',     'roll' => '2207026'],
        ['name' => 'Utsa Roy',         'roll' => '2207027'],
        ['name' => 'Manjar Hossain',   'roll' => '2207029'],
        ['name' => 'Ahmed Kaif',       'roll' => '2207025'],
    ];

    protected array $pendingStudents = [
        ['name' => 'Tanvir Ahmed',     'roll' => '2207030'],
        ['name' => 'Nusrat Jahan',     'roll' => '2207031'],
        ['name' => 'Sadia Islam',      'roll' => '2207032'],
        ['name' => 'Rakib Hasan',      'roll' => '2207033'],
        ['name' => 'Sharmin Akter',    'roll' => '2207035'],
        ['name' => 'Mahfuzur Rahman',  'roll' => '2207036'],
        ['name' => 'Jannatul Ferdous', 'roll' => '2207037'],
        ['name' => 'Arif Hossain',     'roll' => '2207038'],
    ];

    public function run(): void
    {
        foreach ($this->activeStudents as $s) {
            $firstName = strtolower(explode(' ', $s['name'])[0]);
            $lastThree = substr($s['roll'], -3);
            User::create([
                'name'     => $s['name'],
                'email'    => "{$firstName}{$lastThree}@gmail.com",
                'password' => "{$firstName}{$s['roll']}",
                'status'   => 'active',
                'is_super_user' => false,
                'age'      => rand(20, 25),
            ]);
        }

        foreach ($this->pendingStudents as $s) {
            $firstName = strtolower(explode(' ', $s['name'])[0]);
            $lastThree = substr($s['roll'], -3);
            User::create([
                'name'     => $s['name'],
                'email'    => "{$firstName}{$lastThree}@gmail.com",
                'password' => "{$firstName}{$s['roll']}",
                'status'   => 'pending',
                'is_super_user' => false,
                'age'      => rand(20, 25),
            ]);
        }
    }
}
