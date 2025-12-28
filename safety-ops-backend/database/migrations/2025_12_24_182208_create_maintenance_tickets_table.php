<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
public function up()
{
    Schema::create('maintenance_tickets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who reported it
        $table->string('title');
        $table->text('description');
        $table->string('category'); // e.g., 'Road', 'Electric', 'Sewage'
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->string('status')->default('open'); // open, resolved
        $table->timestamps();
        $table->string('image_path')->nullable(); // ✅ Added this
    });
}


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('maintenance_tickets');
    }
};
