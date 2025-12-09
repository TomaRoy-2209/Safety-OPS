<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('incident_media', function (Blueprint $table) {
            $table->id();
            // We added these lines:
            $table->foreignId('incident_id')->constrained('incidents')->onDelete('cascade'); // Links to the Incidents table
            $table->string('file_path'); // Stores the Cloudinary URL
            $table->string('file_type')->nullable(); // Stores 'image/jpeg' etc.
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('incident_media');
    }
};