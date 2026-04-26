<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:nparki', function () {
    $this->info('NParki API is ready.');
});
